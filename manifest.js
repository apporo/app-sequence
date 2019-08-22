module.exports = {
  "config": {
    "validation": {
      "schema": {
        "type": "object",
        "properties": {
          "counterStateKey": {
            "type": "string"
          },
          "sequenceGenerator": {
            "type": "object",
            "patternProperties": {
              "^[a-z][a-z\\-]*[a-z]$": {
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
          },
          "breakOnError": {
            "type": "boolean"
          },
        },
        "additionalProperties": false
      }
    }
  }
};
