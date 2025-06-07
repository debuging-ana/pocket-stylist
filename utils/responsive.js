import { Dimensions, PixelRatio } from 'react-native';

// Base dimensions from iPhone 14 Plus (your reference device)
const BASE_WIDTH = 428;
const BASE_HEIGHT = 926;

// Get current device dimensions
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

// Calculate scale factors
const widthScale = DEVICE_WIDTH / BASE_WIDTH;
const heightScale = DEVICE_HEIGHT / BASE_HEIGHT;

// Use the smaller scale to maintain aspect ratio
const scale = Math.min(widthScale, heightScale);

/**
 * Scale a size value proportionally to the device screen
 * @param {number} size - The size on iPhone 14 Plus
 * @returns {number} - Scaled size for current device
 */
export const scaleSize = (size) => {
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * Scale width specifically
 * @param {number} width - Width on iPhone 14 Plus  
 * @returns {number} - Scaled width for current device
 */
export const scaleWidth = (width) => {
  return Math.round(PixelRatio.roundToNearestPixel(width * widthScale));
};

/**
 * Scale height specifically
 * @param {number} height - Height on iPhone 14 Plus
 * @returns {number} - Scaled height for current device
 */
export const scaleHeight = (height) => {
  return Math.round(PixelRatio.roundToNearestPixel(height * heightScale));
};

/**
 * Scale font size
 * @param {number} fontSize - Font size on iPhone 14 Plus
 * @returns {number} - Scaled font size for current device
 */
export const scaleFontSize = (fontSize) => {
  return Math.round(PixelRatio.roundToNearestPixel(fontSize * scale));
};

/**
 * Get responsive padding/margin values
 * @param {number} value - Padding/margin value on iPhone 14 Plus
 * @returns {number} - Scaled padding/margin for current device
 */
export const scaleSpacing = (value) => {
  return Math.round(PixelRatio.roundToNearestPixel(value * scale));
};

/**
 * Get device dimensions
 */
export const deviceWidth = DEVICE_WIDTH;
export const deviceHeight = DEVICE_HEIGHT;

/**
 * Check if device is considered small (width < 375)
 */
export const isSmallDevice = DEVICE_WIDTH < 375;

/**
 * Check if device is considered large (width > 414)
 */
export const isLargeDevice = DEVICE_WIDTH > 414;

/**
 * Get responsive grid item width for 3-column layout
 * @param {number} containerPadding - Total horizontal padding
 * @param {number} itemSpacing - Spacing between items
 * @returns {number} - Width for each grid item
 */
export const getGridItemWidth = (containerPadding = 40, itemSpacing = 20) => {
  return Math.floor((DEVICE_WIDTH - containerPadding - itemSpacing) / 3);
};

/**
 * Get responsive grid item width for 2-column layout
 * @param {number} containerPadding - Total horizontal padding
 * @param {number} itemSpacing - Spacing between items
 * @returns {number} - Width for each grid item
 */
export const getTwoColumnWidth = (containerPadding = 40, itemSpacing = 20) => {
  return Math.floor((DEVICE_WIDTH - containerPadding - itemSpacing) / 2);
};

/**
 * Safe area adjustments based on device type
 */
export const getSafeAreaInsets = () => {
  // Basic safe area calculations - you might want to use react-native-safe-area-context for more precision
  const hasNotch = DEVICE_HEIGHT >= 812; // iPhone X and newer
  return {
    top: hasNotch ? 44 : 20,
    bottom: hasNotch ? 34 : 0,
  };
}; 