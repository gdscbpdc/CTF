export function getChallengeAttachments(challengeId) {
  // Mock implementation - in real app, fetch from backend
  const attachmentMap = {
    1: [
      {
        id: 'attach1',
        name: 'vulnerable-login.php',
        type: 'text/php',
        downloadUrl: '/attachments/basic-injection/vulnerable-login.php',
      },
      {
        id: 'attach2',
        name: 'readme.txt',
        type: 'text/plain',
        downloadUrl: '/attachments/basic-injection/readme.txt',
      },
    ],
  };

  return attachmentMap[challengeId] || [];
}

export function downloadAttachment(attachment) {
  // In a real implementation, this would trigger a secure download
  window.open(attachment.downloadUrl, '_blank');
}
