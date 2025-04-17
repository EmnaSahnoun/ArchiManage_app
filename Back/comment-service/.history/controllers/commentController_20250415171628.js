const fs = require('fs');
const path = require('path');

exports.addComment = (req, res) => {
    const { taskId } = req.params;
    const { comment, user } = req.body;  // Récupérer le commentaire et le nom d'utilisateur depuis le corps de la requête
    
    const date = new Date().toISOString();  // Format de la date ISO
    const commentWithDetails = `Date: ${date}\nUtilisateur: ${user}\nCommentaire: ${comment}\n\n`;  // Construire le commentaire avec date et utilisateur
    
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
    const { taskId } = req.params;
    const filePath = path.join(__dirname, '..', 'comments', `${taskId}.txt`);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Aucun commentaire trouvé pour cette tâche');
    }
  
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).send('Erreur lors de la suppression du fichier');
      }
      res.send('Commentaires supprimés');
    });
  };
  
