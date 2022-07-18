const clientId = process.env.REACT_APP_API_KEY;
const redirectUri = "http://localhost:3000/";
let acessToken;

const Spotify = {
  getAccessToken() {
    if (acessToken) {
      return acessToken;
    }

    //check for access token
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      acessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);

      //This clears the parameters allowing us to grab new access token when it expires

      window.setTimeout(() => (acessToken = ""), expiresIn * 1000);
      windon.history.pushState("Access Token", null, "/");
      return acessToken;
    } else {
      const acessUrl = ` https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = acessUrl;
    }
  },
};

export default Spotify;
