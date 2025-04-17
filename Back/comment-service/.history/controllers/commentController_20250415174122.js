const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Chemin vers le dossier des commentaires
const COMMENTS_DIR = path.join(__dirname, '..', 'comments');

// Helper functions
const ensureCommentsDirExists = () => {
  if (!fs.existsSync(COMMENTS_DIR)) {
    fs.mkdirSync(COMMENTS_DIR, { recursive: true });
  }
};

const getCommentFilePath = (taskId) => {
  return path.join(COMMENTS_DIR, `${taskId}.txt`);
};

const parseCommentsFile = (fileContent) => {
  return fileContent.split('\n\n')
    .filter(comment => comment.trim() !== '')
    .map(comment => {
      const lines = comment.split('\n');
      const commentObj = {};
      lines.forEach(line => {
        const [key, ...value] = line.split(': ');
        commentObj[key] = value.join(': ');
      });
      return commentObj;
    });
};

const stringifyComments = (comments) => {
  return comments.map(comment => {
    return Object.entries(comment)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }).join('\n\n');
};

// Controllers
exports.addComment = (req, res) => {
  try {
    const { taskId } = req.params;
    const { text, user } = req.body;
    
    if (!text || !user) {
      return res.status(400).json({ error: 'Text and user are required' });
    }

    ensureCommentsDirExists();
    
    const comment = {
      id: uuidv4(),
      date: new Date().toISOString(),
      user,
      text
    };

    const filePath = getCommentFilePath(taskId);
    const commentString = Object.entries(comment)
      .map(([key, val]) => `${key}: ${val}`)
      .join('\n');

    fs.appendFileSync(filePath, `${commentString}\n\n`);
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getComments = (req, res) => {
  try {
    const { taskId } = req.params;
    const filePath = getCommentFilePath(taskId);

    if (!fs.existsSync(filePath)) {
      return res.status(200).json([]);
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const comments = parseCommentsFile(data);
    
    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteComment = (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const filePath = getCommentFilePath(taskId);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'No comments found for this task' });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    let comments = parseCommentsFile(data);
    
    const initialLength = comments.length;
    comments = comments.filter(comment => comment.id !== commentId);
    
    if (comments.length === initialLength) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    fs.writeFileSync(filePath, stringifyComments(comments));
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateComment = (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const filePath = getCommentFilePath(taskId);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'No comments found for this task' });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    let comments = parseCommentsFile(data);
    let commentFound = false;

    comments = comments.map(comment => {
      if (comment.id === commentId) {
        commentFound = true;
        return {
          ...comment,
          text,
          date: new Date().toISOString() // Update modification date
        };
      }
      return comment;
    });

    if (!commentFound) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    fs.writeFileSync(filePath, stringifyComments(comments));
    
    res.json(comments.find(comment => comment.id === commentId));
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};