module.exports = {
  "config": {
    "validation": {
      "schema": {
        "type": "object",
        "properties": {
          "breakOnError": {
            "type": "boolean"
          },
          "counterStateKey": {
            "type": "string"
          },
          "expirationPeriod": {
            "type": "string"
          },
          "sequenceGenerator": {
            "type": "object",
            "patternProperties": {
              "^.+$": {
                "type": "object",
                "properties": {
                  "expirationPeriod": {
                    "type": "string",
                    "enum": [ "y", "m", "d" ]
                  }
                }
              }
            }
          },
          "timeout": {
            "type": "number"
          }
        },
        "additionalProperties": false
      }
    }
  }
};
