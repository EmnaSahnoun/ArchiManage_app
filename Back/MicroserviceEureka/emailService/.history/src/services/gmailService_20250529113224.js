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
const gmailService = require('../services/gmailService');

// Récupérer un email complet avec tous ses éléments
const getFullEmailHandler = async (req, res) => {
  try {
    const { accessToken } = req.query;
    const { emailId } = req.params;

    if (!accessToken || !emailId) {
      return res.status(400).json({ 
        success: false, 
        error: "Paramètres manquants (accessToken, emailId)" 
      });
    }

    const email = await gmailService.getFullEmail(accessToken, emailId);
    
    // Optionnel: Récupérer les pièces jointes complètes si demandé
    if (req.query.includeAttachments === 'true') {
      for (const attachment of email.attachments) {
        attachment.fileData = await gmailService.getAttachment(
          accessToken, 
          emailId, 
          attachment.body.attachmentId
        );
      }
    }

    res.json({ success: true, data: email });
  } catch (error) {
    console.error("Erreur récupération email complet:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de l'email",
      details: error.message
    });
  }
};

// Récupérer les emails avec aperçu des pièces jointes
const getEmailsWithAttachmentsHandler = async (req, res) => {
  try {
    const { accessToken, maxResults = 10 } = req.query;
    
    const emails = await gmailService.getInboxEmails(accessToken, maxResults);
    const enhancedEmails = await Promise.all(
      emails.map(async email => {
        const fullEmail = await gmailService.getFullEmail(accessToken, email.id);
        return {
          ...email,
          hasAttachments: fullEmail.attachments.length > 0,
          attachmentsPreview: fullEmail.attachments.map(a => ({
            filename: a.filename,
            mimeType: a.mimeType,
            size: a.size
          }))
        };
      })
    );

    res.json({ success: true, data: enhancedEmails });
  } catch (error) {
    console.error("Erreur récupération emails avec pièces jointes:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des emails",
      details: error.message
    });
  }
};

module.exports = {
  getFullEmailHandler,
  getEmailsWithAttachmentsHandler,
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
