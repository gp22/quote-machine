import '../css/main.scss';

(function quoteMachine() {
  const URL = 'http://quotes.stormconsultancy.co.uk/random.json';
  const allQuotes = [];
  let currentQuoteIndex = -1;

  const nextButton = document.getElementById('next');
  const prevButton = document.getElementById('previous');
  const quoteParent = document.getElementById('quoteParent');
  const TRANSITIONTIME = 400;

  nextButton.addEventListener('click', getNextQuote);
  prevButton.addEventListener('click', getPrevQuote);
  prevButton.disabled = true;

  // Create new HTML element (element, id, classes...)
  function createNewElement(... element) {
    const newElement = document.createElement(arguments[0]);

    if (arguments[1]) {
      newElement.setAttribute('id', arguments[1]);
    }

    if (arguments.length > 2) {
      const newClass = Array.from(arguments).slice(2, arguments.length).join(' ');
      newElement.setAttribute('class', newClass);
    }

    return newElement;
  }

  function removeListenerAndAddQuote(quote, listener, transitionClass) {
    quote.removeEventListener('transitionend', listener);

    return new Promise((resolve) => {
      addNextQuote(quote, transitionClass)
        .then(() => {
          resolve();
        });
    });
  }

  function transitionHandler(event) {
    quoteParent.removeChild(event.srcElement);
  }

  function removeCurrentQuote(transitionClass) {
    const quoteChild = document.getElementById('quoteChild');

    if (allQuotes.length === 0) {
      return new Promise(resolve => resolve());
    }

    quoteChild.addEventListener('transitionend', transitionHandler);
    quoteChild.classList.add(`${transitionClass}`);

    return new Promise((resolve) => {
      setTimeout(function() {
        resolve();
      }, TRANSITIONTIME);
    });
  }

  function addNextQuote(quoteElement, transitionClass) {
    quoteParent.appendChild(quoteElement);

    return new Promise((resolve) => {
      setTimeout(function() {
        quoteElement.classList.remove(transitionClass);
        resolve();
      }, TRANSITIONTIME);
    });
  }

  function getPrevQuote() {
    prevButton.disabled = true;
    currentQuoteIndex -= 1;
    const prevQuote = allQuotes[currentQuoteIndex];
    const transition = 'main-text--float-below'

    removeCurrentQuote('main-text--float-above')
      .then(() => {
        removeListenerAndAddQuote(prevQuote, transitionHandler, transition)
          .then(() => {
            if (currentQuoteIndex > 0) {
              prevButton.disabled = false;
            }
          });
      });
  }

  function getQuoteFromAPI() {
    const newQuote = createNewElement('div', 'quoteChild', 'main-text', 'main-text--float-above', 'flex-item--center-self');
    const quoteText = createNewElement('p', null, 'main-text--large');
    const quoteAuthor = createNewElement('p');

    newQuote.appendChild(quoteText);
    newQuote.appendChild(quoteAuthor);

    return new Promise((resolve) => {
      fetch(URL)
        .then(response => response.json())
        .then((quoteData) => {
          const { quote, author } = quoteData;

          quoteText.textContent = quote;
          quoteAuthor.textContent = `~ ${author}`;

          addNextQuote(newQuote, 'main-text--float-above')
            .then(() => {
              allQuotes.push(newQuote);
              resolve();
            });
        });
    });
  }

  function getNextQuote() {
    nextButton.disabled = true;
    currentQuoteIndex += 1;

    removeCurrentQuote('main-text--float-below')
      .then(() => {
        if (currentQuoteIndex === allQuotes.length) {
          getQuoteFromAPI()
            .then(() => {
              nextButton.disabled = false;

              if (prevButton.disabled === true && currentQuoteIndex > 0) {
                prevButton.disabled = false;
              }
            });
        } else {
          const nextQuote = allQuotes[currentQuoteIndex];
          const transition = 'main-text--float-above'

          removeListenerAndAddQuote(nextQuote, transitionHandler, transition)
            .then(() => {
              nextButton.disabled = false;

              if (prevButton.disabled === true) {
                prevButton.disabled = false;
              }
            });
        }
      });
  }

  getNextQuote();
})();
