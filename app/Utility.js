define([], function () {
  var Utility = {};

  /**
   * Normalizes a street name by converting it to lowercase, removing periods,
   * and standardizing common suffixes.
   * @param {string} street - The street name to normalize.
   * @returns {string} - The normalized street name.
   */
  Utility.normalizeStreetName = function (street) {
    return street
      .trim()
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/\bstreet\b/g, "st")
      .replace(/\bavenue\b/g, "ave")
      .replace(/\broad\b/g, "rd")
      .replace(/\bdrive\b/g, "dr")
      .replace(/\bsuite\b/g, "ste");
  };

  /**
   * Validates the street input by checking if the entered value matches any
   * of the options in the datalist.
   * @param {HTMLInputElement} streetInput - The street input element.
   * @param {HTMLDataListElement} datalist - The datalist containing street options.
   * @param {HTMLElement} streetError - The element to display error messages.
   */
  Utility.validateStreetInput = function (streetInput, datalist, streetError) {
    var options = datalist.options;
    var enteredValue = streetInput.value.trim().toLowerCase();
    var isValid = false;

    for (var i = 0; i < options.length; i++) {
      if (
        Utility.normalizeStreetName(options[i].value) ===
        Utility.normalizeStreetName(enteredValue)
      ) {
        isValid = true;
        break;
      }
    }

    if (isValid || enteredValue === "") {
      streetInput.style.borderColor = "green";
      streetError.style.display = "none";
      streetInput.setCustomValidity("");
    } else {
      streetInput.style.borderColor = "red";
      streetError.style.display = "block";
      streetInput.setCustomValidity(
        "Please select a valid street from the suggestions."
      );
    }
  };

  /**
   * Handles the Enter key event on the street input field.
   * If the entered street name does not match any in the datalist,
   * it sets the input value to the first suggestion.
   * @param {KeyboardEvent} event - The keydown event.
   * @param {HTMLInputElement} streetInput - The street input element.
   * @param {HTMLDataListElement} datalist - The datalist containing street options.
   */
  Utility.handleEnterKey = function (event, streetInput, datalist) {
    if (event.key === "Enter") {
      var options = Array.from(datalist.options).map(function (option) {
        return Utility.normalizeStreetName(option.value);
      });
      var enteredValue = Utility.normalizeStreetName(streetInput.value);

      // Check if entered value matches any option
      if (!options.includes(enteredValue) && options.length > 0) {
        // Prevent form submission if inside a form
        event.preventDefault();

        // Set the input value to the first suggestion
        streetInput.value = datalist.options[0].value;
        // Validate the updated input
        var streetError = document.getElementById("streetError");
        Utility.validateStreetInput(streetInput, datalist, streetError);
      }
    }
  };

  /**
   * Formats a date object into a readable string.
   * @param {Date} date - The date object to format.
   * @returns {string} - The formatted date string.
   */
  Utility.formatDate = function (date) {
    // Example format: "MM/DD/YYYY"
    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var year = date.getFullYear();
    return month + "/" + day + "/" + year;
  };

  /**
   * Deep clones an object or array.
   * @param {Object|Array} obj - The object or array to clone.
   * @returns {Object|Array} - The cloned object or array.
   */
  Utility.deepClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  /**
   * Generates a unique identifier (UUID v4).
   * @returns {string} - The generated UUID.
   */
  Utility.generateUUID = function () {
    // Simple UUID generator
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
      c
    ) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  /**
   * Parses URL query parameters into an object.
   * @param {string} url - The URL to parse.
   * @returns {Object} - The query parameters as key-value pairs.
   */
  Utility.parseQueryParams = function (url) {
    var params = {};
    var parser = document.createElement("a");
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return params;
  };

  /**
   * Debounces a function, ensuring it only runs after a specified delay.
   * Useful for reducing the frequency of events like window resize or scroll.
   * @param {Function} func - The function to debounce.
   * @param {number} wait - The delay in milliseconds.
   * @returns {Function} - The debounced function.
   */
  Utility.debounce = function (func, wait) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  };

  // Add other utility functions as needed

  return Utility;
});
