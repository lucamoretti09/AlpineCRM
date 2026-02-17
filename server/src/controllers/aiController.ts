import { Request, Response, NextFunction } from 'express';
import aiService from '../services/aiService';

/**
 * Chat with AI assistant
 * @route POST /api/ai/chat
 * @access Private
 */
export const chat = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string',
      });
    }

    const response = await aiService.chat(
      message,
      conversationHistory || [],
      req.user?.id
    );

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
