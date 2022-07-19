const clientId = process.env.REACT_APP_API_KEY;

const redirectUri = "http://olesia-ssound.surge.sh";
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
      window.history.pushState("Access Token", null, "/");
      return acessToken;
    } else {
      const acessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = acessUrl;
    }
  },
  search(term) {
    const acessToken = Spotify.getAccessToken();
    return fetch(
      `https://api.spotify.com/v1/search?type=track&q=${term}
`,
      {
        headers: {
          Authorization: `Bearer ${acessToken}`,
        },
      }
    )
      .then((response) => {
        return response.json();
      })
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
        }));
      });
  },
  savePlayList(name, trackUris) {
    if (!name || !trackUris) {
      return;
    }
    const acessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${acessToken}` };
    let userId;
    return fetch("https://api.spotify.com/v1/me", { headers: headers })
      .then((response) => response.json())
      .then((jsonResponse) => {
        userId = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
          headers: headers,
          method: "POST",
          body: JSON.stringify({ name: name }),
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            const playlistId = jsonResponse.id;
            return fetch(
              `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
              {
                headers: headers,
                method: "POST",
                body: JSON.stringify({ uris: trackUris }),
              }
            );
          });
      });
  },
};

export default Spotify;
