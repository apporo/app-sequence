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
                  "expirationPeriod": {
                    "type": "string",
                    "enum": [ "y", "m", "d" ]
                  }
                }
              }
            }
          },
          "digits": {
            "type": "number",
            "minimum": 3,
            "maximum": 9,
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
