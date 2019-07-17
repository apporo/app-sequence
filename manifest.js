module.exports = {
  "config": {
    "validation": {
      "schema": {
        "type": "object",
        "properties": {
          "contextPath": {
            "type": "string"
          },
          "counterStateKey": {
            "type": "string"
          },
          "autowired": {
            "type": "boolean"
          },
          "priority": {
            "type": "number"
          }
        },
        "additionalProperties": false
      }
    }
  }
};
