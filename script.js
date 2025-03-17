document.addEventListener('DOMContentLoaded', function() {
    // Initialize bank logos slider
    $('.slider').slick({
        slidesToShow: 6,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: false,
        dots: false,
        pauseOnHover: false,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 520,
                settings: {
                    slidesToShow: 2
                }
            }
        ]
    });

    // Logo slider animation
    const logoSlide = document.querySelector('.logos-slide');
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Pixels per frame - reduced for slower movement
    
    function slideLogos() {
        scrollPosition -= scrollSpeed;
        
        // Reset position when reaching half of the content (since we have duplicates)
        if (Math.abs(scrollPosition) >= logoSlide.offsetWidth / 2) {
            scrollPosition = 0;
        }
        
        logoSlide.style.transform = `translateX(${scrollPosition}px)`;
        requestAnimationFrame(slideLogos);
    }
    
    // Start the animation
    slideLogos();

    // Investment Calculator
    const calculator = {
        amount: document.querySelector('#investment-amount'),
        result: document.querySelector('#investment-return'),
        type: document.getElementsByName('investment-type')
    };

    if (calculator.amount) {
        calculator.amount.addEventListener('input', calculateReturn);
        calculator.type.forEach(radio => radio.addEventListener('change', calculateReturn));
        
        // Set initial value
        calculateReturn();
    }

    function calculateReturn() {
        const amount = parseFloat(calculator.amount.value) || 0;
        let rate = 0;
        
        calculator.type.forEach(radio => {
            if (radio.checked) {
                rate = parseFloat(radio.value);
            }
        });

        const returns = (amount * rate / 100).toFixed(0);
        calculator.result.textContent = `$${returns.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }

    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    const BOT_TOKEN = '8107565320:AAFrQTEp2do-P7_qTmR2XSV0U-loFi7j02M';
    const CHAT_ID = '-1002607693972';

    if (contactForm) {
        console.log('Form found and listener attached');
        contactForm.addEventListener('submit', handleSubmit);
    } else {
        console.error('Contact form not found in DOM');
    }

    async function handleSubmit(e) {
        console.log('Form submission started');
        e.preventDefault(); // Prevent form from submitting normally
        
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = 'Sending...';
        console.log('Submit button disabled and text updated');

        try {
            // Collect form data
            const formData = new FormData(this);
            console.log('Form data collected:', Object.fromEntries(formData));
            
            let message = '<b>🔔 New Investment Inquiry</b>\n\n';
            
            // Build message with emojis and formatting
            const fieldEmojis = {
                'name': '👤',
                'phone': '📱',
                'email': '📧',
                'province': '🏠',
                'investment': '💰',
                'amount': '💵',
                'timeline': '⏰',
                'account_type': '🏦'
            };

            // Format the message
            for (let [key, value] of formData.entries()) {
                const emoji = fieldEmojis[key] || '➡️';
                const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                message += `${emoji} <b>${formattedKey}:</b> ${value}\n`;
            }

            // Add timestamp
            const timestamp = new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' });
            message += `\n📅 <b>Submitted:</b> ${timestamp} EST`;

            console.log('Formatted message:', message);
            console.log('Attempting to send to Telegram...');

            // Log the request details
            console.log('Request URL:', `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`);
            console.log('Request body:', {
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            });

            // Send to Telegram
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            console.log('Telegram API response status:', response.status);
            const responseData = await response.json();
            console.log('Telegram API response:', responseData);

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }

            if (responseData.ok) {
                console.log('Message sent successfully to Telegram');
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                        <span>Thank you! We will contact you shortly.</span>
                    </div>`;
                this.insertBefore(successMessage, this.firstChild);
                successMessage.style.display = 'block';
                
                // Reset form
                this.reset();
                console.log('Form reset and success message shown');

                // Hide success message after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                    console.log('Success message hidden');
                }, 5000);
            } else {
                throw new Error(`Telegram API Error: ${responseData.description || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error details:', error);
            // Show error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; background-color: #dc3545; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                    </svg>
                    <span>Sorry, there was an error. Please try again later.</span>
                </div>`;
            this.insertBefore(errorMessage, this.firstChild);
            console.log('Error message shown');
            setTimeout(() => {
                errorMessage.remove();
                console.log('Error message removed');
            }, 5000);
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            console.log('Submit button restored');
        }

        return false; // Prevent form from submitting
    }

    // Add Call Us button
    const callUsBtn = document.createElement('a');
    callUsBtn.href = 'tel:+18002832084';
    callUsBtn.className = 'call-us-btn';
    callUsBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-fill" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
        </svg>
        Call Us
    `;
    document.body.appendChild(callUsBtn);
}); 