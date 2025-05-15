
export const generalSearchModule = {
  name: 'generalSearch',
  process: async (message: string, expertiseLevel: string = 'intermediate') => {
    // For general search, we'll just pass through to the OpenAI API
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          expertiseLevel,
          chatMode: '범용 검색',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content || 'No response received';
    } catch (error) {
      console.error('Error in general search module:', error);
      return `Error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
};
