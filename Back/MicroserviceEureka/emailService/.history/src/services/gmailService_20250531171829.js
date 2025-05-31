const { google } = require("googleapis");
const oAuth2Client = require("../config/googleAuth");
const fileStorage = require('../utils/fileStorage');
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
const sendEmail = async (accessToken, emailData, userId) => {
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

  // Get the full sent email and save to storage
  if (userId) {
    const sentEmail = await getFullEmail(accessToken, response.data.id, false, userId);
    fileStorage.saveEmail(userId, sentEmail, 'sent');
  }
  
  return response.data;
};

// 2. Get Full Email with All Details
const getFullEmail = async (accessToken, emailId, includeAttachmentData = false, userId) => {
  const gmail = getGmailClient(accessToken);
  const response = await gmail.users.messages.get({
    userId: "me",
    id: emailId,
    format: "full"
  });
// Skip if it's a social email
  if (response.data.labelIds?.includes('CATEGORY_SOCIAL')||response.data.labelIds?.includes('CATEGORY_PROMOTIONS')) {
    return null;
  }
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

  // Determine folder based on labels
  let folder = 'inbox';
  if (response.data.labelIds.includes('SENT')) {
    folder = 'sent';
  } else if (response.data.labelIds.includes('DRAFT')) {
    folder = 'drafts';
  }

  // Save to storage
  if (userId) {
    fileStorage.saveEmail(userId, email, folder);
  }

  return email;
};

// 3. Get Received Emails
const getInboxEmails = async (accessToken, maxResults = 20, userId) => {
  const gmail = getGmailClient(accessToken);
  
  // Get emails from storage (skip if null/undefined and filter social)
  const storedEmails = fileStorage.getEmailsFromFolder(userId, 'inbox')
    .filter(email => email && !email.labelIds?.includes('CATEGORY_SOCIAL'));
  
  // Get from Gmail API (exclude social emails directly in the query)
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: parseInt(maxResults),
    q: "-label:CATEGORY_SOCIAL" // Exclude social emails at API level
  });

  if (!response.data.messages) return storedEmails;

  // Get only new emails not in storage
  const newEmails = response.data.messages.filter(
    message => !storedEmails.some(e => e.id === message.id)
  );

  // Fetch and store new emails (skip if getFullEmail returns null)
  const fetchedEmails = await Promise.all(
    newEmails.map(message => getFullEmail(accessToken, message.id, false, userId))
  );

  // Filter out null emails and social emails (double check)
  const validNewEmails = fetchedEmails.filter(
    email => email && !email.labelIds?.includes('CATEGORY_SOCIAL')
  );

  // Store valid emails
  await Promise.all(
    validNewEmails.map(email => fileStorage.saveEmail(userId, email, 'inbox'))
  );

  // Combine and sort (all emails are guaranteed non-null and non-social)
  const allEmails = [...storedEmails, ...validNewEmails].sort(
    (a, b) => new Date(b.internalDate) - new Date(a.internalDate)
  );

  return allEmails.slice(0, maxResults);
};

// 4. Get Sent Emails
const getSentEmails = async (accessToken, maxResults = 20, userId) => {
  const gmail = getGmailClient(accessToken);
  
  const storedEmails = fileStorage.getEmailsFromFolder(userId, 'sent')
  .filter(email => !email.labelIds?.includes('CATEGORY_SOCIAL'||'CATEGORY_PROMOTIONS'));
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["SENT"],
    maxResults: parseInt(maxResults),
    q: "-label:CATEGORY_SOCIAL -label:CATEGORY_PROMOTIONS"
  });

  if (!response.data.messages) return storedEmails;

  const newEmails = response.data.messages.filter(
    message => !storedEmails.some(e => e.id === message.id)
  );

  await Promise.all(
    newEmails.map(async (message) => {
      await getFullEmail(accessToken, message.id, false, userId);
    })
  );

  const allEmails = [
    ...storedEmails,
    ...(await Promise.all(
      newEmails.map(message => getFullEmail(accessToken, message.id, false, userId))
    ))
  ].sort((a, b) => new Date(b.internalDate) - new Date(a.internalDate));

  return allEmails.slice(0, maxResults);
};

// 5. Delete Email
const deleteEmail = async (accessToken, emailId, permanent = false, userId) => {
  const gmail = getGmailClient(accessToken);
  
  // First determine the folder by checking where the email exists
  let folder = null;
  if (fileStorage.emailExists(userId, emailId, 'inbox')) {
    folder = 'inbox';
  } else if (fileStorage.emailExists(userId, emailId, 'sent')) {
    folder = 'sent';
  } else if (fileStorage.emailExists(userId, emailId, 'drafts')) {
    folder = 'drafts';
  }

  if (permanent) {
    await gmail.users.messages.delete({ userId: "me", id: emailId });
  } else {
    await gmail.users.messages.trash({ userId: "me", id: emailId });
  }

  // Delete from storage if it exists
  if (folder) {
    fileStorage.deleteEmail(userId, emailId, folder);
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
  if (userId) {
    const draftEmail = await getFullEmail(accessToken, response.data.message.id, false, userId);
    fileStorage.saveEmail(userId, draftEmail, 'drafts');
  }
  
  return response.data;
};

const getDrafts = async (accessToken, maxResults = 10, userId) => {
  const gmail = getGmailClient(accessToken);
  
  // First get from storage
  const storedDrafts = fileStorage.getEmailsFromFolder(userId, 'drafts');
  
  // Then get from API to check for new drafts
  const response = await gmail.users.drafts.list({
    userId: "me",
    labelIds: ["DRAFT"],
    maxResults: parseInt(maxResults)
  });

  if (!response.data.drafts) return storedDrafts;

  // Get only new drafts
  const newDrafts = response.data.drafts.filter(
    draft => !storedDrafts.some(d => d.id === draft.id)
  );

  // Fetch and store new drafts with error handling
  const newDraftsProcessed = await Promise.all(
    newDrafts.map(async (draft) => {
      try {
        const draftDetails = await gmail.users.drafts.get({
          userId: "me",
          id: draft.id
        });
        
        const message = await getFullEmail(accessToken, draftDetails.data.message.id, false, userId);
        
        return {
          id: draft.id,
          message: message || null // Ensure we always return an object
        };
      } catch (error) {
        console.error(`Error processing draft ${draft.id}:`, error);
        return {
          id: draft.id,
          message: null,
          error: error.message
        };
      }
    })
  );

  // Filter out failed drafts and null messages
  const validNewDrafts = newDraftsProcessed.filter(
    draft => draft.message !== null && draft.message.internalDate
  );

  // Combine with stored drafts
  const allDrafts = [
    ...storedDrafts,
    ...validNewDrafts
  ];

  // Sort with fallback for missing dates
  allDrafts.sort((a, b) => {
    const dateA = a.message?.internalDate ? new Date(a.message.internalDate) : new Date(0);
    const dateB = b.message?.internalDate ? new Date(b.message.internalDate) : new Date(0);
    return dateB - dateA;
  });

  return allDrafts.slice(0, maxResults);
};

const deleteDraft = async (accessToken, draftId, userId) => {
  const gmail = getGmailClient(accessToken);
  
  await gmail.users.drafts.delete({
    userId: "me",
    id: draftId
  });
  
  // Delete from storage
  fileStorage.deleteEmail(userId, draftId, 'drafts');
};

const sendDraft = async (accessToken, draftId, userId) => {
  const gmail = getGmailClient(accessToken);
  
  const response = await gmail.users.drafts.send({
    userId: "me",
    requestBody: { id: draftId }
  });
  
  if (userId) {
    // Delete from drafts
    fileStorage.deleteEmail(userId, draftId, 'drafts');
    // Save to sent
    const sentEmail = await getFullEmail(accessToken, response.data.id, false, userId);
    fileStorage.saveEmail(userId, sentEmail, 'sent');
  }
  
  return response.data;
};

// Add a new function to get email from storage
const getEmailFromStorage = (userId, emailId) => {
  // Check in all folders
  const folders = ['inbox', 'sent', 'drafts'];
  for (const folder of folders) {
    const email = fileStorage.getEmailFromFolder(userId, emailId, folder);
    if (email) return email;
  }
  return null;
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
  sendDraft,
  getEmailFromStorage
};