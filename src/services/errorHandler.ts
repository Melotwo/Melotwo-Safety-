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
              // FIX: Replaced JSX with React.createElement to be compatible with .ts files. JSX syntax is only allowed in .tsx files.
              message: (
                React.createElement(React.Fragment, null,
                  React.createElement("p", null, "There seems to be an issue with your API key configuration. Please take the following steps:"),
                  React.createElement("ul", { className: "list-disc list-inside mt-2 space-y-1 text-sm" },
                    React.createElement("li", null,
                      React.createElement("strong", null, "Verify Key:"),
                      " Ensure your API key is correct and has been added to the server's environment variables (",
                      React.createElement("code", null, "VITE_API_KEY"),
                      ")."
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
      } else if (lowerCaseMessage.includes('fetch') || lowerCaseMessage.includes('network')) {
          errorState = {
              title: 'Network Connection Error',
              message: 'Failed to connect to the AI service. Please check your internet connection and any firewall settings, then try again.',
          };
      } else if (lowerCaseMessage.includes('malformed')) {
          errorState = {
              title: 'Invalid Request',
              message: 'The data sent to the AI service was malformed. This could be due to a temporary issue. Please try rephrasing your inputs or try again later.',
          };
      } else if (lowerCaseMessage.includes('resource has been exhausted')) {
          errorState = {
              title: 'Resource Limit Reached',
              message: 'The model has reached its resource limit for this request. Please try again with a shorter or less complex prompt.',
          };
      }
    }
    
    // FIX: Added a return statement to ensure the function always returns a value as per its type signature.
    return errorState;
};
