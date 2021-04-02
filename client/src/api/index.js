import axios from "axios";

const TOKEN = "4AUFMvQbjLwRnnuM5NLQqVwj8WPu-wQgNssRZjpV9WDDjnvNI68";

export default axios.create({
  baseURL:
    "https://tranquil-escarpment-56296.herokuapp.com/https://api.pandascore.co/matches",
  params: {
    token: TOKEN,
  },
});
