const { google } = require("googleapis");
const oAuth2Client = require("../config/googleAuth");

// Fonction pour obtenir une instance authentifiée de l'API Gmail
const getGmailClient = (accessToken) => {
  if (!accessToken) {
    throw new Error("Access token manquant pour l'opération Gmail.");
  }
  // Cloner l'objet oAuth2Client pour éviter les modifications globales
  const client = new google.auth.OAuth2(
    oAuth2Client.clientId_,
    oAuth2Client.clientSecret_,
    oAuth2Client.redirectUri_
  );
  client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: client });
};

// Envoyer un email
const sendEmail = async (accessToken, emailData) => {
  const gmail = getGmailClient(accessToken);
  console.log("c'est quoi le gmail",gmail)
  const message = [
    `From: ${emailData.from}`,
    `To: ${emailData.to}`,
    "Content-Type: text/html; charset=utf-8",
    `Subject: ${emailData.subject}`,
    "",
    emailData.body,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });
  return response.data;
};

// Récupérer les emails envoyés
const getSentEmails = async (accessToken, maxResults) => {
  const gmail = getGmailClient(accessToken);
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["SENT"],
    maxResults: parseInt(maxResults),
  });

  if (!response.data.messages) {
      return []; // Retourner un tableau vide si aucun message envoyé
  }

  const messages = await Promise.all(
    response.data.messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });
      return {
        id: msg.data.id,
        snippet: msg.data.snippet,
        payload: msg.data.payload,
        internalDate: msg.data.internalDate,
        labelIds: msg.data.labelIds,
        isRead: !msg.data.labelIds.includes("UNREAD"),
      };
    })
  );
  return messages;
};

// Supprimer un email
const deleteEmail = async (accessToken, emailId, permanent) => {
  const gmail = getGmailClient(accessToken);
  if (permanent) {
    await gmail.users.messages.delete({
      userId: "me",
      id: emailId,
    });
  } else {
    await gmail.users.messages.trash({
      userId: "me",
      id: emailId,
    });
  }
};

// Récupérer les brouillons
const getDrafts = async (accessToken, maxResults) => {
  const gmail = getGmailClient(accessToken);
  const response = await gmail.users.drafts.list({
    userId: "me",
    maxResults: parseInt(maxResults),
  });

  if (!response.data.drafts) {
      return []; // Retourner un tableau vide si aucun brouillon
  }

  const drafts = await Promise.all(
    response.data.drafts.map(async (draft) => {
      const draftDetails = await gmail.users.drafts.get({
        userId: "me",
        id: draft.id,
        format: "full",
      });
      return {
        id: draft.id,
        message: draftDetails.data.message,
      };
    })
  );
  return drafts;
};

// Supprimer un brouillon
const deleteDraft = async (accessToken, draftId) => {
  const gmail = getGmailClient(accessToken);
  await gmail.users.drafts.delete({
    userId: "me",
    id: draftId,
  });
};

// Restaurer un email depuis la corbeille
const restoreEmail = async (accessToken, emailId) => {
  const gmail = getGmailClient(accessToken);
  await gmail.users.messages.untrash({
    userId: "me",
    id: emailId,
  });
};

// Récupérer les emails entrants
const getInboxEmails = async (accessToken, maxResults) => {
  const gmail = getGmailClient(accessToken);
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: parseInt(maxResults),
  });

  if (!response.data.messages) {
      return []; // Retourner un tableau vide si aucun message dans la boîte de réception
  }

  const emails = await Promise.all(
    response.data.messages.map(async (message) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject", "Date"],
      });

      return {
        id: msg.data.id,
        from: msg.data.payload.headers.find((h) => h.name === "From").value,
        subject: msg.data.payload.headers.find((h) => h.name === "Subject").value,
        date: msg.data.payload.headers.find((h) => h.name === "Date").value,
        isRead: !msg.data.labelIds.includes("UNREAD"),
        labels: msg.data.labelIds,
      };
    })
  );
  return emails;
};

// Marquer un email comme lu
const markAsRead = async (accessToken, emailId) => {
  const gmail = getGmailClient(accessToken);
  await gmail.users.messages.modify({
    userId: "me",
    id: emailId,
    requestBody: {
      removeLabelIds: ["UNREAD"],
    },
  });
};

// Vérifier si un email a été lu
const checkEmailReadStatus = async (accessToken, emailId) => {
  const gmail = getGmailClient(accessToken);
  const response = await gmail.users.messages.get({
    userId: "me",
    id: emailId,
    format: "metadata",
    metadataHeaders: ["From", "To", "Subject"],
  });

  const isRead = !response.data.labelIds.includes("UNREAD");
  return {
    isRead,
    labels: response.data.labelIds,
    snippet: response.data.snippet,
  };
};
// Récupère le contenu complet d'un email avec tous ses éléments
const getFullEmail = async (accessToken, emailId) => {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const res = await gmail.users.messages.get({
    userId: 'me',
    id: emailId,
    format: 'full'
  });

  return parseEmail(res.data);
};

// Parse l'email et ses composants
const parseEmail = (emailData) => {
  const result = {
    id: emailData.id,
    threadId: emailData.threadId,
    labelIds: emailData.labelIds,
    snippet: emailData.snippet,
    internalDate: new Date(parseInt(emailData.internalDate)),
    headers: {},
    parts: [],
    attachments: []
  };

  // Extraction des headers
  emailData.payload.headers.forEach(header => {
    result.headers[header.name.toLowerCase()] = header.value;
  });

  // Traitement des parties du message
  if (emailData.payload.parts) {
    emailData.payload.parts.forEach(part => {
      const partData = processPart(part);
      if (partData.isAttachment) {
        result.attachments.push(partData);
      } else {
        result.parts.push(partData);
      }
    });
  } else {
    // Email sans multipart
    result.parts.push(processPart(emailData.payload));
  }

  return result;
};

// Traite une partie du message
const processPart = (part) => {
  const partData = {
    mimeType: part.mimeType,
    body: part.body,
    isAttachment: part.filename && part.filename.length > 0,
    filename: part.filename || null,
    size: part.body.size || 0,
    content: null
  };

  // Décodage du contenu
  if (part.body.data) {
    partData.content = Buffer.from(part.body.data, 'base64');
    
    // Conversion en texte/HTML selon le type
    if (part.mimeType === 'text/plain') {
      partData.text = partData.content.toString('utf8');
    } else if (part.mimeType === 'text/html') {
      partData.html = partData.content.toString('utf8');
    }
  }

  // Traitement des sous-parties (pour les emails imbriqués)
  if (part.parts) {
    partData.parts = part.parts.map(processPart);
  }

  return partData;
};

// Récupère les pièces jointes complètes
const getAttachment = async (accessToken, emailId, attachmentId) => {
  const oAuth2Client = new google.auth.OAuth2();
  oAuth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  const res = await gmail.users.messages.attachments.get({
    userId: 'me',
    messageId: emailId,
    id: attachmentId
  });

  return {
    data: Buffer.from(res.data.data, 'base64'),
    size: res.data.size
  };
};


module.exports = {
  getFullEmail,
  getAttachment,
  sendEmail,
  getSentEmails,
  deleteEmail,
  getDrafts,
  deleteDraft,
  restoreEmail,
  getInboxEmails,
  markAsRead,
  checkEmailReadStatus,
};
