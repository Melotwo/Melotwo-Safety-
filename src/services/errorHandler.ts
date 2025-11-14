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
                      " Make sure the Generative Language API is enabled for your project."
                    )
                  )
                )
              ),
          };
      } else if (lowerCaseMessage.includes('model not found')) {
          errorState = {
              title: 'Model Not Found',
              message: "The specified AI model could not be found. This might be a temporary issue or a configuration error. Please try again shortly.",
          };
      } else if (lowerCaseMessage.includes('billing') || lowerCaseMessage.includes('quota')) {
          errorState = {
              title: 'Billing or Quota Issue',
              message: "Your request could not be completed due to a billing or quota limit. Please check your project's billing status and API usage quotas in your Google Cloud dashboard.",
          };
      } else {
        // For other generic errors, use the error message directly if it's informative
        errorState.message = err.message;
      }
    }
    
    return errorState;
};
