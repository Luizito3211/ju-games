const xpPerLevel = 100;
let totalXp = 0;
let adIndex = 0;
let quizIndex = 0;
let quizAnswered = false;
let quizScore = 0;

const levelLabel = document.getElementById("levelLabel");
const xpLabel = document.getElementById("xpLabel");
const xpFill = document.getElementById("xpFill");
const adTitle = document.getElementById("adTitle");
const adMessage = document.getElementById("adMessage");
const adSlides = document.getElementById("adSlides");
const adDots = document.getElementById("adDots");
const toast = document.getElementById("toast");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const achievementStatus = document.getElementById("achievementStatus");
const authModal = document.getElementById("authModal");
const authUser = document.getElementById("authUser");
const logoutButton = document.getElementById("logoutButton");
const authTabs = document.querySelectorAll(".auth-tab");
const authForms = document.querySelectorAll(".auth-form");
const authMessage = document.getElementById("authMessage");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const forgotForm = document.getElementById("forgotForm");

const USERS_KEY = "ju_games_users";
const SESSION_KEY = "ju_games_logged_user";

// PUBLICIDADE: os jogos abaixo aparecem no carrossel do banner.
const ads = [
  {
    title: "Bob Esponja",
    creator: "Julia de Almeida",
    url: "https://spiffy-rugelach-0f95c1.netlify.app/"
  },
  {
    title: "Branca de Neve",
    creator: "Gabriela Zanotto",
    url: "https://mellow-pithivier-0a980d.netlify.app/"
  },
  {
    title: "Sapinho e Frutinhas",
    creator: "Gabriela Moreira",
    url: "https://superb-blini-f25780.netlify.app/"
  },
  {
    title: "Dinossauro",
    creator: "Guilherme Thenorio",
    url: "https://merry-treacle-727dc3.netlify.app/"
  },
  {
    title: "Fantasia",
    creator: "Diego Vizari",
    url: "https://chimerical-shortbread-6ee684.netlify.app/"
  },
  {
    title: "Netlands",
    creator: "Eduardo Filipe",
    url: "https://rococo-frangollo-06f594.netlify.app/"
  }
];

// QUIZ: cada pergunta aceita apenas uma resposta e o quiz nao reinicia.
// Organizado do mais fácil ao mais difícil com posições de respostas embaralhadas.
const quizQuestions = [
  {
    question: "Qual jogo tem sapinho no nome?",
    options: ["Dinossauro", "Branca de Neve", "Sapinho e Frutinhas"],
    answer: "Sapinho e Frutinhas",
    reward: 15
  },
  {
    question: "Qual botao voce usa para ganhar XP nos jogos?",
    options: ["Jogar", "Regras", "Todos os jogos"],
    answer: "Jogar",
    reward: 15
  },
  {
    question: "Qual barra indica que voce esta evoluindo no site?",
    options: ["O Carrossel", "A barra de XP", "O Rodape"],
    answer: "A barra de XP",
    reward: 15
  },
  {
    question: "Quem criou o jogo principal do Bob Esponja?",
    options: ["Guilherme Thenorio", "Eduardo Filipe", "Julia de Almeida"],
    answer: "Julia de Almeida",
    reward: 15
  },
  {
    question: "Qual jogo foi feito por Diego Vizari?",
    options: ["Netlands", "Fantasia", "Flappy Bird"],
    answer: "Fantasia",
    reward: 15
  },
  {
    question: "Qual dos jogos abaixo NAO foi feito pela turma e NAO esta no site?",
    options: ["Dinossauro", "Minecraft", "Sapinho e Frutinhas"],
    answer: "Minecraft",
    reward: 15
  },
  {
    question: "Quanto XP o jogo principal do Bob Esponja da?",
    options: ["25 XP", "100 XP", "50 XP"],
    answer: "50 XP",
    reward: 15
  }
];

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeUserName(name) {
  return name.trim().toLowerCase();
}

function setAuthMessage(message) {
  if (authMessage) {
    authMessage.textContent = message;
  }
}

function setActiveAuthTab(tabName) {
  authTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.authTab === tabName);
  });

  authForms.forEach((form) => {
    form.classList.toggle("active", form.id === `${tabName}Form`);
  });

  setAuthMessage("");
}

function updateAuthState() {
  const loggedUser = localStorage.getItem(SESSION_KEY);

  if (authUser) {
    authUser.textContent = loggedUser ? `Ola, ${loggedUser}` : "Visitante";
  }

  if (logoutButton) {
    logoutButton.hidden = !loggedUser;
  }

  if (authModal) {
    authModal.classList.toggle("is-open", !loggedUser);
  }
}

function loginUser(userName) {
  localStorage.setItem(SESSION_KEY, userName);
  updateAuthState();
  showToast(`Bem-vindo, ${userName}!`);
}

function updateXpBar() {
  const currentLevel = Math.floor(totalXp / xpPerLevel) + 1;
  const currentLevelXp = totalXp % xpPerLevel;
  const progress = (currentLevelXp / xpPerLevel) * 100;

  levelLabel.textContent = `Nivel ${currentLevel}`;
  xpLabel.textContent = `${currentLevelXp} / ${xpPerLevel} XP`;
  xpFill.style.width = `${progress}%`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function addXp(points, sourceName) {
  const previousLevel = Math.floor(totalXp / xpPerLevel) + 1;
  totalXp += points;
  const newLevel = Math.floor(totalXp / xpPerLevel) + 1;

  updateXpBar();

  if (newLevel > previousLevel) {
    showToast(`${sourceName}: +${points} XP. Subiste para o nivel ${newLevel}!`);
    return;
  }

  showToast(`${sourceName}: +${points} XP adicionados!`);
}

function setupGameXpButtons() {
  document.querySelectorAll("[data-xp]").forEach((gameLink) => {
    gameLink.addEventListener("click", (event) => {
      event.preventDefault();

      const points = Number(gameLink.dataset.xp);
      const gameName = gameLink.dataset.game;
      const gameUrl = gameLink.getAttribute("href");
      const hasGameUrl = gameUrl && gameUrl !== "#";

      addXp(points, gameName);

      if (hasGameUrl) {
        window.open(gameUrl, "_blank", "noopener,noreferrer");
      }
    });
  });
}

function renderAdCarousel() {
  adSlides.innerHTML = "";
  adDots.innerHTML = "";

  ads.forEach((ad, index) => {
    const slide = document.createElement("div");
    const iframe = document.createElement("iframe");
    const dot = document.createElement("button");

    slide.className = "ad-slide";

    iframe.src = ad.url;
    iframe.title = `Previa do jogo ${ad.title}`;
    iframe.loading = index === 0 ? "eager" : "lazy";
    iframe.allow = "autoplay; fullscreen; gamepad";
    iframe.setAttribute("tabindex", "-1");

    slide.appendChild(iframe);

    dot.className = "ad-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Mostrar ${ad.title} no carrossel`);
    dot.addEventListener("click", () => {
      adIndex = index;
      updateAdBanner();
    });

    adSlides.appendChild(slide);
    adDots.appendChild(dot);
  });
}

function updateAdBanner() {
  const currentAd = ads[adIndex];
  const slides = adSlides.querySelectorAll(".ad-slide");
  const dots = adDots.querySelectorAll(".ad-dot");

  adTitle.textContent = currentAd.title;
  adMessage.textContent = `Criado por ${currentAd.creator}`;

  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === adIndex);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === adIndex);
  });
}

function startAdCarousel() {
  renderAdCarousel();
  updateAdBanner();

  setInterval(() => {
    adIndex = (adIndex + 1) % ads.length;
    updateAdBanner();
  }, 12000);
}

function renderQuiz() {
  const currentQuestion = quizQuestions[quizIndex];
  quizAnswered = false;
  quizOptions.innerHTML = "";

  if (!currentQuestion) {
    quizQuestion.textContent = "Quiz finalizado!";
    achievementStatus.textContent = `Voce acertou ${quizScore} de ${quizQuestions.length} perguntas.`;
    return;
  }

  quizQuestion.textContent = currentQuestion.question;

  currentQuestion.options.forEach((option) => {
    const button = document.createElement("button");

    button.className = "quiz-option";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => handleQuizAnswer(button, option));

    quizOptions.appendChild(button);
  });
}

function handleQuizAnswer(selectedButton, selectedOption) {
  if (quizAnswered) {
    return;
  }

  const currentQuestion = quizQuestions[quizIndex];
  const isCorrect = selectedOption === currentQuestion.answer;
  const buttons = quizOptions.querySelectorAll(".quiz-option");

  quizAnswered = true;

  buttons.forEach((button) => {
    button.disabled = true;
    button.classList.toggle("correct", button.textContent === currentQuestion.answer);
  });

  if (!isCorrect) {
    selectedButton.classList.add("wrong");
    achievementStatus.textContent = "Quase! Proxima pergunta em instantes.";
  } else {
    quizScore += 1;
    addXp(currentQuestion.reward, "Quiz XP");
    achievementStatus.textContent = "Conquista desbloqueada: Resposta certeira!";
  }

  setTimeout(() => {
    quizIndex += 1;
    renderQuiz();
  }, 1800);
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveAuthTab(tab.dataset.authTab));
});

if (registerForm) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const userName = document.getElementById("registerUser").value.trim();
    const password = document.getElementById("registerPassword").value;
    const recovery = document.getElementById("registerRecovery").value.trim();
    const normalizedName = normalizeUserName(userName);
    const users = getUsers();

    if (users.some((user) => user.normalizedName === normalizedName)) {
      setAuthMessage("Esse usuario ja existe.");
      return;
    }

    users.push({
      name: userName,
      normalizedName,
      password,
      recovery
    });

    saveUsers(users);
    registerForm.reset();
    loginUser(userName);
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const userName = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPassword").value;
    const normalizedName = normalizeUserName(userName);
    const user = getUsers().find((item) => item.normalizedName === normalizedName);

    if (!user || user.password !== password) {
      setAuthMessage("Usuario ou senha incorretos.");
      return;
    }

    loginForm.reset();
    loginUser(user.name);
  });
}

if (forgotForm) {
  forgotForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const userName = document.getElementById("forgotUser").value.trim();
    const recovery = document.getElementById("forgotRecovery").value.trim();
    const newPassword = document.getElementById("forgotPassword").value;
    const normalizedName = normalizeUserName(userName);
    const users = getUsers();
    const user = users.find((item) => item.normalizedName === normalizedName);

    if (!user || user.recovery !== recovery) {
      setAuthMessage("Usuario ou palavra de recuperacao incorretos.");
      return;
    }

    user.password = newPassword;
    saveUsers(users);
    forgotForm.reset();
    setActiveAuthTab("login");
    setAuthMessage("Senha alterada. Entre com a nova senha.");
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    setActiveAuthTab("login");
    updateAuthState();
  });
}

// Inicialização do sistema
updateAuthState();
updateXpBar();
setupGameXpButtons();
startAdCarousel();
renderQuiz();

const chatToggle = document.querySelector("#chat-toggle");
const chatWidget = document.querySelector("#chat-widget");
const chatClose = document.querySelector("#chat-close");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-messages");
const chatSubmit = chatForm?.querySelector("button[type='submit']");
const chatHistory = [];

function setChatLoading(isLoading) {
  if (chatInput) {
    chatInput.disabled = isLoading;
  }

  if (chatSubmit) {
    chatSubmit.disabled = isLoading;
    chatSubmit.textContent = isLoading ? "Enviando" : "Enviar";
  }
}

function scrollChatToBottom() {
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function addChatMessage(text, type, saveToHistory = true) {
  const message = document.createElement("div");
  message.classList.add("chat-message", `chat-message-${type}`);
  message.textContent = text;

  chatMessages.appendChild(message);
  scrollChatToBottom();

  if (saveToHistory && (type === "user" || type === "bot")) {
    chatHistory.push({
      role: type === "user" ? "user" : "assistant",
      content: text
    });

    if (chatHistory.length > 8) {
      chatHistory.shift();
    }
  }

  return message;
}

async function askGroq(userText) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: userText,
      history: chatHistory.slice(0, -1)
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Nao foi possivel gerar a resposta agora.");
  }

  return data.reply || "Desculpe, nao consegui montar uma resposta agora.";
}

function showChatTyping(userText) {
  const typingMessage = addChatMessage("Digitando...", "bot", false);
  typingMessage.classList.add("chat-message-typing");
  setChatLoading(true);

  /*
      A integracao com IA real fica no backend em:
      api/chat.js

      Coloque sua chave do Groq Cloud em uma variavel de ambiente chamada
      GROQ_API_KEY. Nao coloque chaves de API neste arquivo, pois o navegador
      mostra o JavaScript para qualquer visitante.
  */
  askGroq(userText)
    .then((reply) => {
      typingMessage.remove();
      addChatMessage(reply, "bot");
    })
    .catch((error) => {
      typingMessage.remove();
      addChatMessage(
        error.message || "Nao consegui responder com a IA agora. Tente novamente em instantes.",
        "bot",
        false
      );
    })
    .finally(() => {
      setChatLoading(false);

      if (chatInput) {
        chatInput.focus();
      }
    });
}

if (chatToggle && chatWidget) {
  chatToggle.addEventListener("click", () => {
    chatWidget.classList.toggle("is-open");

    if (chatWidget.classList.contains("is-open") && chatInput) {
      chatInput.focus();
    }
  });
}

if (chatClose && chatWidget) {
  chatClose.addEventListener("click", () => {
    chatWidget.classList.remove("is-open");
  });
}

if (chatForm && chatInput && chatMessages) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const userText = chatInput.value.trim();

    if (!userText) {
      return;
    }

    addChatMessage(userText, "user");
    chatInput.value = "";
    showChatTyping(userText);
  });
}
