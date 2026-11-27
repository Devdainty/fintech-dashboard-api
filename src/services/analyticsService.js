const AnalyticsEvent = require("../models/AnalyticsEvent");
const logger = require("../config/logger");

const trackEvent = async (eventType, userId) => {
  try {
    if (!eventType || !userId) return;

    await AnalyticsEvent.create({ eventType, userId });
    logger.debug({ eventType, userId }, "Analytics event recorded");
  } catch (err) {
    logger.warn(
      { err: err.message, eventType, userId },
      "Analytics tracking failed; bypassed gracefully",
    );
  }
};

module.exports = { trackEvent };
