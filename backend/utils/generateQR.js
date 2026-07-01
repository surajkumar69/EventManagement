import QRCode from 'qrcode';

/**
 * Generate a QR Code base64 Data URL from a text string
 * @param {string} text - The text/data to encode in the QR code
 * @returns {Promise<string>} - Base64 encoded QR Code data URL
 */
const generateQR = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff', // white
      },
      width: 300,
      margin: 2,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Could not generate QR code');
  }
};

export default generateQR;
