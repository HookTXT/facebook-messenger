export const initFacebookSDK = (): void => {
  window.fbAsyncInit = function() {
    FB.init({
      appId      : import.meta.env.VITE_FACEBOOK_APP_ID,
      cookie     : true,
      xfbml      : true,
      version    : 'v19.0'
    });
  };

  // Load the SDK asynchronously
  (function(d, s, id) {
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
};