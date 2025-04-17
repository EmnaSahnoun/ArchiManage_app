const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');  // Importation de UUID pour générer des identifiants uniques

exports.addComment = (req, res) => {
  const { taskId } = req.params;
  const { comment, user } = req.body;
  
  const idCommentaire = uuidv4();  // Générer un ID unique pour chaque commentaire
  const date = new Date().toISOString();  // Date au format ISO
  
  const commentWithDetails = `ID: ${idCommentaire}\nDate: ${date}\nUtilisateur: ${user}\nCommentaire: ${comment}\n\n`;
  
  const filePath = path.join(__dirname, '..', 'comments', `${taskId}.txt`);

  fs.appendFile(filePath, commentWithDetails, (err) => {
    if (err) return res.status(500).send('Erreur lors de l\'écriture');
    res.send('Commentaire ajouté');
  });
};

  exports.getComments = (req, res) => {
    const { taskId } = req.params;
    const filePath = path.join(__dirname, '..', 'comments', `${taskId}.txt`);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Aucun commentaire trouvé');
    }
  
    const data = fs.readFileSync(filePath, 'utf8');
    res.send(data);
  };
  exports.deleteComment = (req, res) => {
    const { taskId, idCommentaire } = req.params;  // Récupérer taskId et idCommentaire depuis les paramètres de la requête
    const filePath = path.join(__dirname, '..', 'comments', `${taskId}.txt`);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Aucun commentaire trouvé pour cette tâche');
    }
  
    // Lire le fichier de commentaires
    const data = fs.readFileSync(filePath, 'utf8');
    const comments = data.split('\n\n');  // Supposons que chaque commentaire est séparé par un double saut de ligne
  
    // Chercher le commentaire à supprimer
    const commentIndex = comments.findIndex(comment => comment.includes(`ID: ${idCommentaire}`));
  
    if (commentIndex === -1) {
      return res.status(404).send('Commentaire introuvable');
    }
  
    // Supprimer le commentaire du tableau
    comments.splice(commentIndex, 1);
  
    // Réécrire le fichier avec les commentaires restants
    fs.writeFileSync(filePath, comments.join('\n\n'), 'utf8');
    
    res.send('Commentaire supprimé');
  };
  
  exports.updateComment = (req, res) => {
    const { taskId, commentId } = req.params;  // taskId pour la tâche, commentId pour le commentaire
    const { newComment, user } = req.body;  // Nouveau commentaire et utilisateur
  
    const filePath = path.join(__dirname, '..', 'comments', `${taskId}.txt`);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Aucun commentaire trouvé pour cette tâche');
    }
  
    // Lire le fichier de commentaires
    const data = fs.readFileSync(filePath, 'utf8');
    const comments = data.split('\n\n');  // Supposons que chaque commentaire est séparé par un double saut de ligne
  
    // Trouver le commentaire à modifier (par exemple, on peut identifier le commentaire par son index ou une partie de son contenu)
    const commentIndex = comments.findIndex(comment => comment.includes(`Utilisateur: ${user}`) && comment.includes(newComment));
  
    if (commentIndex === -1) {
      return res.status(404).send('Commentaire à modifier introuvable');
    }
  
    // Remplacer le commentaire
    comments[commentIndex] = `Date: ${new Date().toISOString()}\nUtilisateur: ${user}\nCommentaire: ${newComment}\n\n`;
  
    // Écrire à nouveau les commentaires modifiés dans le fichier
    fs.writeFileSync(filePath, comments.join('\n\n'), 'utf8');
    res.send('Commentaire modifié');
  };
    
