const express = require("express");
const emailController = require("../controllers/emailController");

const router = express.Router();

// Envoyer un email
router.post("/send", upload.any(), emailController.sendEmail);



// Récupérer les emails envoyés
router.get("/sent", emailController.getSentEmailsHandler);

// Récupérer les emails entrants (boîte de réception)
router.get("/inbox", emailController.getInboxEmailsHandler);

// Marquer un email comme lu
router.post("/mark-as-read", emailController.markAsReadHandler);

// Vérifier si un email spécifique a été lu
router.get("/check-read/:emailId", emailController.checkEmailReadStatusHandler);

// Supprimer un email spécifique (vers corbeille ou définitivement)
router.delete("/:emailId", emailController.deleteEmailHandler);

// Restaurer un email depuis la corbeille
router.post("/:emailId/restore", emailController.restoreEmailHandler);

router.get('/:emailId/full', emailController.getFullEmailHandler);
router.get('/with-attachments', emailController.getEmailsWithAttachmentsHandler);


module.exports = router;
