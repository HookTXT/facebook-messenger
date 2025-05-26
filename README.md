# Facebook Messenger Plugin for HookTXT

This plugin allows HookTXT users to integrate Facebook Messenger directly into their workflow. It provides a seamless way to manage Facebook Page conversations without leaving the HookTXT platform.

## Features

-   **Facebook Login**: Connect your Facebook account to access your Pages.
-   **Page Selection**: Choose which Facebook Page to connect to HookTXT.
-   **Conversation Management**: View and respond to messages from your Facebook Page.
-   **Real-time Updates**: Receive new messages and updates in real-time.

## Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Configuration**:

    -   Create a `.env` file in the root directory.
    -   Add your Facebook App ID:

        ```
        VITE_FACEBOOK_APP_ID=your-facebook-app-id
        ```

4.  **Run the application**:

    ```bash
    npm run dev
    ```

## Integration with HookTXT

To integrate this plugin with HookTXT, follow these steps:

1.  **Embed the plugin**:

    -   Render the `<FacebookIntegration />` component within the HookTXT UI.
    -   Ensure the component is placed in the desired section of the HookTXT interface.

2.  **Handle state persistence**:

    -   Implement state persistence to maintain the user's login status and selected page across page loads.
    -   Use local storage or a similar mechanism to store the Facebook access token and page ID.

3.  **Implement real-time updates**:

    -   Set up real-time updates for new messages using WebSockets or a similar technology.
    -   When a new message is received, update the conversation list and message display in real-time.

## Dependencies

-   `react`: "^18.3.1"
-   `react-dom`: "^18.3.1"
-   `lucide-react`: "^0.344.0"
-   `tailwindcss`: "^3.4.1"
-   `vite`: "^5.4.2"

## Local Storage Usage

This plugin uses local storage to store Facebook access tokens and webhook data. The following keys are used:

-   `hooktxt_facebook_tokens`: Stores Facebook access tokens.
-   `hooktxt_facebook_webhooks`: Stores webhook configuration data.

## Mock Data

The plugin uses mock data for conversations and messages. In a real-world implementation, you would replace this with data fetched from the Facebook Graph API.

## Notes

-   This plugin is designed to be embedded within the HookTXT UI.
-   It does not include a separate dashboard or page.
-   The back button in the `MessengerChat` component is necessary for mobile view to navigate back to the conversation list.

