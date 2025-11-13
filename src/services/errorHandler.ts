import React from 'react';
import { ErrorState } from '../types';

/**
 * Processes an unknown error from an API call and returns a structured ErrorState object
 * with a user-friendly title and actionable troubleshooting steps.
 * @param err The error object caught from a try...catch block.
 * @returns An ErrorState object to be used in the UI.
 */
export const getApiErrorState = (err: unknown): ErrorState => {
    console.error("API Error:", err);
    
    // Default error state for unexpected issues
    let errorState: ErrorState = {
      title: 'An Unexpected Error Occurred',
      message: 'Something went wrong while communicating with the AI service. Please check the console for details and try again later.',
    };

    if (err instanceof Error) {
      const lowerCaseMessage = err.message.toLowerCase();
      
      if (lowerCaseMessage.includes('api key') || lowerCaseMessage.includes('permission denied')) {
          errorState = {
              title: 'API Key or Permission Issue',
              message: (
                React.createElement(React.Fragment, null,
                  React.createElement("p", null, "There seems to be an issue with the API key configuration. Please take the following steps:"),
                  React.createElement("ul", { className: "list-disc list-inside mt-2 space-y-1 text-sm" },
                    React.createElement("li", null,
                      React.createElement("strong", null, "Verify Key:"),
                      " Ensure the API key is correct and properly configured."
                    ),
                    React.createElement("li", null,
                      React.createElement("strong", null, "Check Permissions:"),
                      " Log in to your Google AI Studio dashboard and confirm the API key is valid and enabled."
                    ),
                    React.createElement("li", null,
                      React.createElement("strong", null, "Enable API:"),
                      " Make sure the Generative Language API is enabled for your Google Cloud project."
                    )
                  )
                )
              ),
          };
      } else if (lowerCaseMessage.includes('quota')) {
          errorState = {
              title: 'API Quota Exceeded',
              message: 'You have exceeded your request limit for the AI service. Please check your usage and billing details in your Google Cloud dashboard or wait before trying again.',
          };
      } else if (lowerCaseMessage.includes('blocked')) {
          errorState = {
              title: 'Content Moderation Error',
              message: 'The request was blocked by the AI\'s safety filters. This can happen if the prompt is flagged as potentially harmful. Please try rephrasing your request.',
          };
      } else if (lowerCaseMessage.includes('fetch') || lowerCaseMessage.includes('network')) {
          errorState = {
              title: 'Network Connection Error',
              message: 'Failed to connect to the AI service. Please check your internet connection and any firewall settings, then try again.',
          };
      } else if (lowerCaseMessage.includes('malformed') || lowerCaseMessage.includes('400') || lowerCaseMessage.includes('bad request')) {
          errorState = {
              title: 'Invalid Request',
              message: 'The data sent to the AI service was invalid. This could be due to a temporary issue or incorrect input format. Please check your inputs or try again later.',
          };
      } else if (lowerCaseMessage.includes('500') || lowerCaseMessage.includes('server error') || lowerCaseMessage.includes('internal error')) {
           errorState = {
              title: 'AI Service Error',
              message: 'The AI service encountered an internal error and could not complete your request. This is likely a temporary issue. Please try again in a few moments.',
          };
      } else if (lowerCaseMessage.includes('resource has been exhausted')) {
          errorState = {
              title: 'Resource Limit Reached',
              message: 'The model has reached its resource limit for this request. Please try again with a shorter or less complex prompt.',
          };
      } else {
        // Fallback for other specific errors
        errorState = {
            title: 'An Unexpected Error Occurred',
            message: `Details: "${err.message}". Please try again.`,
        };
      }
    }
    
    return errorState;
};
