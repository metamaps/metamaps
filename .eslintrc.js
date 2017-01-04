module.exports = {
  "sourceType": "module",
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "extends": "standard",
  "installedESLint": true,
  "env": {
    "es6": true,
    "node": true
  },
  "plugins": [
    "promise",
    "standard",
    "react"
  ],
  "rules": {
    "react/jsx-uses-react": [2],
    "react/jsx-uses-vars": [2],
    "space-before-function-paren": [2, "never"],
    "yoda": [2, "never", { "exceptRange": true }]
  }
}
