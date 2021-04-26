export const removeHTMLTags = (str: string): string => str.replace(/<[^>]*>/g, '');
export const removeSpecialChar = (str: string): string => str.replace(/&#{0,1}[a-z0-9]+;/gi, '');
