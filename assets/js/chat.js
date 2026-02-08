// Chat functionality for AI Tharun chatbot
document.addEventListener('DOMContentLoaded', () => {
	const chatMessages = document.getElementById('chatMessages');
	const chatInput = document.getElementById('chatInput');
	const sendButton = document.getElementById('sendButton');
	const chatStatus = document.getElementById('chatStatus');
	
	// TODO: Replace with your Cloudflare tunnel endpoint
	const API_ENDPOINT = 'YOUR_CLOUDFLARE_TUNNEL_URL_HERE';
	
	let isWaitingForResponse = false;
	
	// Initialize chat
	function initChat() {
		// Focus input on load
		chatInput.focus();
		
		// Load chat history from localStorage if available
		loadChatHistory();
	}
	
	// Send message function
	async function sendMessage() {
		const message = chatInput.value.trim();
		
		if (!message || isWaitingForResponse) {
			return;
		}
		
		// Add user message to chat
		addMessage(message, 'user');
		
		// Clear input
		chatInput.value = '';
		
		// Disable input and button
		setLoadingState(true);
		
		// Show typing indicator
		showTypingIndicator();
		
		try {
			// Send request to your API
			const response = await fetch(API_ENDPOINT, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					message: message,
					conversation_history: getConversationHistory()
				})
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json();
			
			// Remove typing indicator
			removeTypingIndicator();
			
			// Add bot response
			if (data.response || data.message) {
				addMessage(data.response || data.message, 'bot');
			} else {
				throw new Error('Invalid response format');
			}
			
		} catch (error) {
			console.error('Error sending message:', error);
			removeTypingIndicator();
			addMessage('Sorry, I encountered an error. Please try again later.', 'bot');
		} finally {
			setLoadingState(false);
			chatInput.focus();
		}
	}
	
	// Add message to chat
	function addMessage(text, sender) {
		const messageDiv = document.createElement('div');
		messageDiv.className = `message ${sender}-message`;
		
		const avatar = document.createElement('div');
		avatar.className = 'message-avatar';
		avatar.innerHTML = sender === 'user' 
			? '<i class="fas fa-user"></i>' 
			: '<i class="fas fa-robot"></i>';
		
		const content = document.createElement('div');
		content.className = 'message-content';
		
		const paragraph = document.createElement('p');
		// Format message text (preserve line breaks, handle code blocks)
		paragraph.innerHTML = formatMessage(text);
		
		content.appendChild(paragraph);
		messageDiv.appendChild(avatar);
		messageDiv.appendChild(content);
		
		chatMessages.appendChild(messageDiv);
		scrollToBottom();
		
		// Save to localStorage
		saveChatHistory();
	}
	
	// Format message text (handle markdown-like formatting)
	function formatMessage(text) {
		// Escape HTML first
		let formatted = escapeHtml(text);
		
		// Convert line breaks to <br>
		formatted = formatted.replace(/\n/g, '<br>');
		
		// Handle code blocks (```code```)
		formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
		
		// Handle inline code (`code`)
		formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
		
		// Handle bold (**text**)
		formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
		
		// Handle italic (*text*)
		formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
		
		return formatted;
	}
	
	// Escape HTML
	function escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
	
	// Show typing indicator
	function showTypingIndicator() {
		chatStatus.textContent = 'Typing';
		chatStatus.classList.add('typing');
		
		const typingDiv = document.createElement('div');
		typingDiv.className = 'message bot-message typing-indicator-message';
		typingDiv.id = 'typingIndicator';
		
		const avatar = document.createElement('div');
		avatar.className = 'message-avatar';
		avatar.innerHTML = '<i class="fas fa-robot"></i>';
		
		const content = document.createElement('div');
		content.className = 'message-content';
		
		const typingIndicator = document.createElement('div');
		typingIndicator.className = 'typing-indicator';
		typingIndicator.innerHTML = '<span></span><span></span><span></span>';
		
		content.appendChild(typingIndicator);
		typingDiv.appendChild(avatar);
		typingDiv.appendChild(content);
		
		chatMessages.appendChild(typingDiv);
		scrollToBottom();
	}
	
	// Remove typing indicator
	function removeTypingIndicator() {
		chatStatus.textContent = '';
		chatStatus.classList.remove('typing');
		
		const typingIndicator = document.getElementById('typingIndicator');
		if (typingIndicator) {
			typingIndicator.remove();
		}
	}
	
	// Set loading state
	function setLoadingState(loading) {
		isWaitingForResponse = loading;
		chatInput.disabled = loading;
		sendButton.disabled = loading;
		
		if (loading) {
			sendButton.style.opacity = '0.5';
		} else {
			sendButton.style.opacity = '1';
		}
	}
	
	// Scroll to bottom
	function scrollToBottom() {
		chatMessages.scrollTop = chatMessages.scrollHeight;
	}
	
	// Get conversation history for API
	function getConversationHistory() {
		const messages = chatMessages.querySelectorAll('.message:not(.typing-indicator-message)');
		const history = [];
		
		messages.forEach(msg => {
			const isUser = msg.classList.contains('user-message');
			const text = msg.querySelector('.message-content p').textContent;
			history.push({
				role: isUser ? 'user' : 'assistant',
				content: text
			});
		});
		
		return history;
	}
	
	// Save chat history to localStorage
	function saveChatHistory() {
		const messages = Array.from(chatMessages.querySelectorAll('.message:not(.typing-indicator-message)')).map(msg => {
			const isUser = msg.classList.contains('user-message');
			const text = msg.querySelector('.message-content p').textContent;
			return {
				sender: isUser ? 'user' : 'bot',
				text: text
			};
		});
		
		localStorage.setItem('chatHistory', JSON.stringify(messages));
	}
	
	// Load chat history from localStorage
	function loadChatHistory() {
		const saved = localStorage.getItem('chatHistory');
		if (saved) {
			try {
				const messages = JSON.parse(saved);
				// Clear initial bot message
				chatMessages.innerHTML = '';
				
				// Restore messages
				messages.forEach(msg => {
					addMessage(msg.text, msg.sender);
				});
			} catch (error) {
				console.error('Error loading chat history:', error);
			}
		}
	}
	
	// Clear chat history
	function clearChatHistory() {
		localStorage.removeItem('chatHistory');
		chatMessages.innerHTML = '';
		addMessage('Hi! I\'m AI Tharun. Ask me anything about my work, projects, or experience!', 'bot');
	}
	
	// Event listeners
	sendButton.addEventListener('click', sendMessage);
	
	chatInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	});
	
	// Initialize chat
	initChat();
});
