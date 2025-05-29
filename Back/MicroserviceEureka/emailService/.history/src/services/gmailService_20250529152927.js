const { google } = require("googleapis");
const oAuth2Client = require("../config/googleAuth");
const fileStorage = require('./fileStorageService');
// Helper function to get authenticated Gmail client
const getGmailClient = (accessToken) => {
  const client = new google.auth.OAuth2(
    oAuth2Client.clientId_,
    oAuth2Client.clientSecret_,
    oAuth2Client.redirectUri_
  );
  client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: client });
};

// Helper function to process email parts
const processEmailPart = (part) => {
  const partData = {
    mimeType: part.mimeType,
    filename: part.filename || null,
    size: part.body.size || 0,
    isAttachment: !!part.filename,
    content: null,
    headers: {}
  };

  // Process headers
  if (part.headers) {
    part.headers.forEach(header => {
      partData.headers[header.name.toLowerCase()] = header.value;
    });
  }

  // Decode content
  if (part.body.data) {
    partData.content = Buffer.from(part.body.data, 'base64');
    if (part.mimeType === 'text/plain') {
      partData.text = partData.content.toString('utf8');
    } else if (part.mimeType === 'text/html') {
      partData.html = partData.content.toString('utf8');
    }
  }

  // Process nested parts
  if (part.parts) {
    partData.parts = part.parts.map(processEmailPart);
  }

  return partData;
};

// 1. Email Sending with Attachments
const sendEmail = async (accessToken, emailData) => {
  const gmail = getGmailClient(accessToken);
  
  const messageParts = [
    `From: ${emailData.from}`,
    `To: ${emailData.to}`,
    `Subject: ${emailData.subject}`,
    `Content-Type: multipart/mixed; boundary="mixed_boundary"`,
    "",
    "--mixed_boundary",
    `Content-Type: multipart/alternative; boundary="alt_boundary"`,
    "",
    "--alt_boundary",
    "Content-Type: text/plain; charset=utf-8",
    "",
    emailData.text || "",
    "",
    "--alt_boundary",
    "Content-Type: text/html; charset=utf-8",
    "",
    emailData.html || "",
    "",
    "--alt_boundary--"
  ];

  // Add attachments if any
  if (emailData.attachments && emailData.attachments.length > 0) {
    emailData.attachments.forEach(attachment => {
      messageParts.push(
        "--mixed_boundary",
        `Content-Type: ${attachment.mimeType}`,
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        "Content-Transfer-Encoding: base64",
        "",
        attachment.content.toString('base64'),
        ""
      );
    });
  }

  messageParts.push("--mixed_boundary--");
  
  const rawMessage = messageParts.join("\n");
  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage }
  });
  return response.data;
};

// 2. Get Full Email with All Details
const getFullEmail = async (accessToken, emailId, includeAttachmentData = false) => {
  const gmail = getGmailClient(accessToken);
  const response = await gmail.users.messages.get({
    userId: "me",
    id: emailId,
    format: "full"
  });

  const email = {
    id: response.data.id,
    threadId: response.data.threadId,
    labelIds: response.data.labelIds,
    snippet: response.data.snippet,
    internalDate: new Date(parseInt(response.data.internalDate)),
    headers: {},
    parts: [],
    attachments: [],
    isRead: !response.data.labelIds.includes("UNREAD")
  };

  // Process headers
  response.data.payload.headers.forEach(header => {
    email.headers[header.name.toLowerCase()] = header.value;
  });

  // Process email parts
  const processParts = (parts) => {
    parts.forEach(part => {
      const processedPart = processEmailPart(part);
      if (processedPart.isAttachment) {
        email.attachments.push(processedPart);
      } else {
        email.parts.push(processedPart);
      }
    });
  };

  if (response.data.payload.parts) {
    processParts(response.data.payload.parts);
  } else {
    processParts([response.data.payload]);
  }

  // Get full attachment data if requested
  if (includeAttachmentData) {
    await Promise.all(email.attachments.map(async (attachment) => {
      if (attachment.body.attachmentId) {
        const attachmentRes = await gmail.users.messages.attachments.get({
          userId: "me",
          messageId: emailId,
          id: attachment.body.attachmentId
        });
        attachment.content = Buffer.from(attachmentRes.data.data, 'base64');
      }
    }));
  }

  return email;
};

// 3. Get Received Emails
const getInboxEmails = async (accessToken, maxResults = 20, userId) => {
  const gmail = getGmailClient(accessToken);
  
  // Charger les emails déjà sauvegardés
  const savedEmails = userId ? fileStorage.loadEmails(userId) : [];
  const lastSavedEmailId = savedEmails.length > 0 ? savedEmails[0].id : null;

  // Récupérer les emails depuis Gmail
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: parseInt(maxResults)
  });

  if (!response.data.messages) return [];

  // Filtrer pour ne garder que les nouveaux emails
  const newEmails = lastSavedEmailId 
    ? response.data.messages.filter(msg => {
        const isNew = !savedEmails.some(e => e.id === msg.id);
        return isNew;
      })
    : response.data.messages;

  // Récupérer les détails complets des nouveaux emails
  const fullEmails = await Promise.all(
    newEmails.map(async (message) => {
      return await getFullEmail(accessToken, message.id, false);
    })
  );

  // Sauvegarder les nouveaux emails
  if (userId && fullEmails.length > 0) {
    const updatedEmails = [...fullEmails, ...savedEmails];
    fileStorage.saveEmails(userId, updatedEmails);
  }

  return fullEmails;
};

// 4. Get Sent Emails
const getSentEmails = async (accessToken, maxResults = 20) => {
  const gmail = getGmailClient(accessToken);
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["SENT"],
    maxResults: parseInt(maxResults)
  });

  if (!response.data.messages) return [];

  return Promise.all(
    response.data.messages.map(async (message) => {
      return await getFullEmail(accessToken, message.id, false);
    })
  );
};

// 5. Delete Email
const deleteEmail = async (accessToken, emailId, permanent = false, userId) => {
  const gmail = getGmailClient(accessToken);
  if (permanent) {
    await gmail.users.messages.delete({ userId: "me", id: emailId });
  } else {
    await gmail.users.messages.trash({ userId: "me", id: emailId });
  }
  
  if (userId) {
    fileStorage.deleteEmailFromFile(userId, emailId);
  }
};


// 6. Mark Email as Read
const markAsRead = async (accessToken, emailId) => {
  const gmail = getGmailClient(accessToken);
  await gmail.users.messages.modify({
    userId: "me",
    id: emailId,
    requestBody: {
      removeLabelIds: ["UNREAD"]
    }
  });
};

// 7. Draft Management
const createDraft = async (accessToken, draftData) => {
  const gmail = getGmailClient(accessToken);
  
  const messageParts = [
    `From: ${draftData.from}`,
    `To: ${draftData.to}`,
    `Subject: ${draftData.subject}`,
    "Content-Type: text/html; charset=utf-8",
    "",
    draftData.body
  ];

  const rawMessage = messageParts.join("\n");
  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.drafts.create({
    userId: "me",
    requestBody: {
      message: { raw: encodedMessage }
    }
  });
  if (userId && response.data) {
    fileStorage.saveDraft(userId, response.data.id, response.data);
  }
  
  return response.data;
};

const getDrafts = async (accessToken, maxResults = 10) => {
  if (userId) {
    // Charger depuis les fichiers si userId est fourni
    const { draftsDir } = fileStorage.ensureUserDir(userId);
    const draftFiles = fs.readdirSync(draftsDir);
    return draftFiles.slice(0, maxResults).map(file => {
      const draftId = file.replace('.json', '');
      return fileStorage.loadDraft(userId, draftId);
    });
  } else {
  const gmail = getGmailClient(accessToken);
  const response = await gmail.users.drafts.list({
    userId: "me",
    maxResults: parseInt(maxResults)
  });

  if (!response.data.drafts) return [];

  return Promise.all(
    response.data.drafts.map(async (draft) => {
      const draftDetails = await gmail.users.drafts.get({
        userId: "me",
        id: draft.id
      });
      return {
        id: draft.id,
        message: await getFullEmail(accessToken, draftDetails.data.message.id)
      };
    })
  );}
};

const deleteDraft = async (accessToken, draftId) => {
  const gmail = getGmailClient(accessToken);
  await gmail.users.drafts.delete({
    userId: "me",
    id: draftId
  });
  if (userId) {
    fileStorage.deleteDraftFile(userId, draftId);
  }
};

const sendDraft = async (accessToken, draftId) => {
  const gmail = getGmailClient(accessToken);
  const response = await gmail.users.drafts.send({
    userId: "me",
    requestBody: { id: draftId }
  });
  return response.data;
};

module.exports = {
  sendEmail,
  getFullEmail,
  getInboxEmails,
  getSentEmails,
  deleteEmail,
  markAsRead,
  createDraft,
  getDrafts,
  deleteDraft,
  sendDraft
};