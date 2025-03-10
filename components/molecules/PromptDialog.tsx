import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField
} from '@mui/material';

interface PromptDialogProps {
  isOpen: boolean;
  prompt: string;
  onClose: () => void;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const PromptDialog: React.FC<PromptDialogProps> = ({
  isOpen,
  prompt,
  onClose,
  onPromptChange,
  onGenerate,
  isGenerating
}) => {
  return (
    <Dialog 
      open={isOpen} 
      onClose={isGenerating ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Edit Image Generation Prompt</DialogTitle>
      
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={6}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          disabled={isGenerating}
          variant="outlined"
          margin="normal"
        />
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={isGenerating}
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={onGenerate}
          disabled={isGenerating}
          color="primary" 
          variant="contained"
        >
          {isGenerating ? "Generating..." : "Generate Image"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptDialog;
