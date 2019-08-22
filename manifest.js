module.exports = {
  "config": {
    "validation": {
      "schema": {
        "type": "object",
        "properties": {
          "counterStateKey": {
            "type": "string"
          },
          "sequenceDescriptor": {
            "type": "object",
            "patternProperties": {
              "^[a-z][a-z\\-]*[a-z]$": {
                "type": "object",
                "properties": {
                  "digits": {
                    "type": "number",
                    "minimum": 3,
                    "maximum": 9,
                  },
                  "expirationPeriod": {
                    "type": "string",
                    "enum": [ "y", "m", "d" ]
                  }
                },
                "additionalProperties": false
              }
            }
          },
          "timeout": {
            "type": "number"
          },
          "breakOnError": {
            "type": "boolean"
          },
          "errorCodes": {
            "type": "object",
            "patternProperties": {
              "^[a-zA-Z]\\w*$": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string"
                  },
                  "returnCode": {
                    "oneOf": [
                      {
                        "type": "number"
                      },
                      {
                        "type": "string"
                      }
                    ]
                  },
                  "statusCode": {
                    "type": "number"
                  },
                  "description": {
                    "type": "string"
                  }
                },
                "additionalProperties": false
              }
            }
          },
        },
        "additionalProperties": false
      }
    }
  }
};
