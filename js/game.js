// Memory Card Game - Main JavaScript File
class MemoryCardGame {
    constructor() {
        this.currentStage = 1;
        this.maxStages = 10;
        this.moves = 0;
        this.matches = 0;
        this.flippedCards = [];
        this.matchedCards = [];
        this.gameBoard = null;
        this.soundEnabled = true;
        this.currentTheme = 'animals';
        this.gameStartTime = null;
        this.isGameActive = false;
        
        // Game themes with emoji icons
        this.themes = {
            animals: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦉', '🦅', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌'],
            fruits: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥒', '🌶️', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖'],
            vehicles: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚁', '✈️', '🛩️', '🚀', '🛸', '🚢', '⛵', '🚤', '🛥️', '🛳️', '⚓'],
            nature: ['🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌾', '🌿', '🍀', '🍃', '🌱', '🌲', '🌳', '🌴', '🌵', '🌶️', '🍄', '🌰', '🌊', '🔥', '⭐', '🌟', '💫', '⚡', '☀️', '🌙', '🌈', '☁️', '⛅', '🌤️']
        };
        
        // Stage configurations (number of pairs for each stage)
        this.stageConfigs = [
            { stage: 1, pairs: 2, gridSize: '2x2' },
            { stage: 2, pairs: 4, gridSize: '3x3' },
            { stage: 3, pairs: 6, gridSize: '4x3' },
            { stage: 4, pairs: 8, gridSize: '4x4' },
            { stage: 5, pairs: 10, gridSize: '4x5' },
            { stage: 6, pairs: 12, gridSize: '5x5' },
            { stage: 7, pairs: 15, gridSize: '5x6' },
            { stage: 8, pairs: 18, gridSize: '6x6' },
            { stage: 9, pairs: 21, gridSize: '6x7' },
            { stage: 10, pairs: 24, gridSize: '6x8' }
        ];
        
        this.init();
    }
    
    init() {
        this.gameBoard = document.getElementById('game-board');
        this.setupEventListeners();
        this.updateUI();
        this.startStage(this.currentStage);
    }
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('restart-btn').addEventListener('click', () => this.restartStage());
        document.getElementById('theme-btn').addEventListener('click', () => this.showThemeModal());
        document.getElementById('sound-btn').addEventListener('click', () => this.toggleSound());
        
        // Modal buttons
        document.getElementById('close-theme-modal').addEventListener('click', () => this.hideThemeModal());
        document.getElementById('next-stage-btn').addEventListener('click', () => this.nextStage());
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        
        // Theme selection
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTheme = e.target.dataset.theme;
                this.hideThemeModal();
                this.startStage(this.currentStage);
            });
        });
    }
    
    startStage(stage) {
        this.currentStage = stage;
        this.moves = 0;
        this.matches = 0;
        this.flippedCards = [];
        this.matchedCards = [];
        this.gameStartTime = Date.now();
        this.isGameActive = true;
        
        this.updateUI();
        this.generateCards();
        this.updateCharacterMessage(`Stage ${stage}! Find ${this.stageConfigs[stage - 1].pairs} pairs!`);
    }
    
    generateCards() {
        const config = this.stageConfigs[this.currentStage - 1];
        const totalCards = config.pairs * 2;
        const themeIcons = this.themes[this.currentTheme];
        
        // Select random icons for this stage
        const selectedIcons = this.shuffleArray([...themeIcons]).slice(0, config.pairs);
        
        // Create pairs
        const cardData = [...selectedIcons, ...selectedIcons];
        const shuffledCards = this.shuffleArray(cardData);
        
        // Clear game board
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board stage-${this.currentStage}`;
        
        // Create card elements
        shuffledCards.forEach((icon, index) => {
            const card = this.createCardElement(icon, index);
            this.gameBoard.appendChild(card);
        });
    }
    
    createCardElement(icon, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.icon = icon;
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-content">${icon}</div>
            <div class="card-back">❓</div>
        `;
        
        card.addEventListener('click', () => this.flipCard(card));
        
        return card;
    }
    
    flipCard(card) {
        if (!this.isGameActive || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }
        
        if (this.flippedCards.length >= 2) {
            return;
        }
        
        // Flip the card
        card.classList.add('flipped');
        this.flippedCards.push(card);
        this.playSound('flip');
        
        // Check for match if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateUI();
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const icon1 = card1.dataset.icon;
        const icon2 = card2.dataset.icon;
        
        if (icon1 === icon2) {
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            
            this.matchedCards.push(card1, card2);
            this.matches++;
            this.playSound('match');
            this.celebrateMatch();
            this.updateCharacterMessage('Great match! 🎉');
            
            // Check if stage is complete
            if (this.matches === this.stageConfigs[this.currentStage - 1].pairs) {
                setTimeout(() => {
                    this.completeStage();
                }, 1500);
            }
        } else {
            // No match
            card1.classList.add('wrong');
            card2.classList.add('wrong');
            
            setTimeout(() => {
                card1.classList.remove('flipped', 'wrong');
                card2.classList.remove('flipped', 'wrong');
            }, 1000);
            
            this.updateCharacterMessage('Try again! 🤔');
        }
        
        this.flippedCards = [];
    }
    
    celebrateMatch() {
        const character = document.getElementById('main-character');
        const sprite = character.querySelector('.character-sprite');
        
        sprite.classList.add('celebrating');
        setTimeout(() => {
            sprite.classList.remove('celebrating');
        }, 1000);
    }
    
    completeStage() {
        this.isGameActive = false;
        const timeElapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.playSound('stage-complete');
        
        // Update modal content
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-time').textContent = timeString;
        
        if (this.currentStage === this.maxStages) {
            // Game complete
            this.showGameCompleteModal();
        } else {
            // Stage complete
            this.showStageCompleteModal();
        }
    }
    
    showStageCompleteModal() {
        const modal = document.getElementById('stage-complete-modal');
        const message = document.getElementById('stage-complete-message');
        message.textContent = `Excellent! You completed stage ${this.currentStage}! Ready for stage ${this.currentStage + 1}?`;
        modal.classList.remove('hidden');
    }
    
    showGameCompleteModal() {
        const modal = document.getElementById('game-complete-modal');
        modal.classList.remove('hidden');
        this.playSound('celebration');
    }
    
    nextStage() {
        document.getElementById('stage-complete-modal').classList.add('hidden');
        this.showLoadingScreen();
        
        setTimeout(() => {
            this.hideLoadingScreen();
            this.startStage(this.currentStage + 1);
        }, 2000);
    }
    
    restartGame() {
        document.getElementById('game-complete-modal').classList.add('hidden');
        this.currentStage = 1;
        this.startStage(1);
    }
    
    restartStage() {
        this.startStage(this.currentStage);
    }
    
    showThemeModal() {
        document.getElementById('theme-modal').classList.remove('hidden');
    }
    
    hideThemeModal() {
        document.getElementById('theme-modal').classList.add('hidden');
    }
    
    showLoadingScreen() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }
    
    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const btn = document.getElementById('sound-btn');
        btn.textContent = this.soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audio = document.getElementById(`${type}-sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    updateUI() {
        document.getElementById('current-stage').textContent = this.currentStage;
        document.getElementById('moves-count').textContent = this.moves;
        document.getElementById('matches-count').textContent = this.matches;
    }
    
    updateCharacterMessage(message) {
        const bubble = document.getElementById('speech-bubble');
        const p = bubble.querySelector('p');
        p.textContent = message;
        
        // Animate bubble
        bubble.style.animation = 'none';
        bubble.offsetHeight; // Trigger reflow
        bubble.style.animation = 'bubblePop 0.5s ease-out';
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}

// Character reactions and animations
class CharacterAnimations {
    constructor(game) {
        this.game = game;
        this.characters = ['🐱', '🐶', '🐭', '🐰', '🦊', '🐻', '🐼'];
        this.currentCharacterIndex = 0;
        this.setupCharacterRotation();
    }
    
    setupCharacterRotation() {
        // Change character every stage
        setInterval(() => {
            if (!this.game.isGameActive) {
                this.rotateCharacter();
            }
        }, 30000); // Change every 30 seconds when not playing
    }
    
    rotateCharacter() {
        this.currentCharacterIndex = (this.currentCharacterIndex + 1) % this.characters.length;
        const sprite = document.querySelector('.character-sprite');
        sprite.textContent = this.characters[this.currentCharacterIndex];
    }
    
    celebrateStageComplete() {
        const character = document.querySelector('.character-sprite');
        character.style.animation = 'celebrate 2s ease-in-out';
        
        setTimeout(() => {
            character.style.animation = '';
        }, 2000);
    }
}

// Enhanced sound management
class SoundManager {
    constructor() {
        this.sounds = {};
        this.loadSounds();
    }
    
    loadSounds() {
        const soundTypes = ['flip', 'match', 'celebration', 'stage-complete'];
        
        soundTypes.forEach(type => {
            const audio = document.getElementById(`${type}-sound`);
            if (audio) {
                this.sounds[type] = audio;
                audio.volume = 0.7; // Set default volume
            }
        });
    }
    
    play(type, volume = 0.7) {
        const sound = this.sounds[type];
        if (sound) {
            sound.volume = volume;
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    }
}

// Particle effects for celebrations
class ParticleEffects {
    constructor() {
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.setupCanvas();
    }
    
    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);
        return canvas;
    }
    
    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticle(x, y) {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            decay: Math.random() * 0.02 + 0.01,
            size: Math.random() * 5 + 2,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };
    }
    
    celebrate(x, y) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(this.createParticle(x, y));
        }
        this.animate();
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            
            return particle.life > 0;
        });
        
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new MemoryCardGame();
    const characterAnimations = new CharacterAnimations(game);
    const soundManager = new SoundManager();
    const particleEffects = new ParticleEffects();
    
    // Add particle effects to match celebrations
    const originalCelebrateMatch = game.celebrateMatch;
    game.celebrateMatch = function() {
        originalCelebrateMatch.call(this);
        
        // Create particles at random card positions
        const cards = document.querySelectorAll('.card.matched');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            particleEffects.celebrate(x, y);
        });
    };
    
    // Enhanced sound integration
    game.playSound = function(type) {
        if (this.soundEnabled) {
            soundManager.play(type);
        }
    };
    
    // Make game globally accessible for debugging
    window.memoryGame = game;
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}

