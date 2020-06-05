export const buttonTemplates = {
  invite:
        [
          {
            text: 'Join',
            type: 1,
            response: {
              action: 'accept',
            },

          },
          {
            text: 'Busy',
            response: {
              action: 'busy',
              showResponse: true,
            },
            close: true,
          },
        ],
  busy:
    [ {
      text: 'OK',
      close: true,
    } ],
};