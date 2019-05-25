module.exports = {
  isDev: false,
  localConfig: {
    region: "us-west-2",
    endpoint: "http://localhost:8000"
  },
  onlineConfig: {
    region: "us-west-2",
    endpoint: "http://localhost:8000",
    //"dynamodb.us-west-2.amazonaws.com",

    accessKeyId: "AKIAII56X4EHJSADC2KA",
    secretAccessKey: "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"
  },

  address: "http://moviesinfo.us-west-2.elasticbeanstalk.com"
};
