document.addEventListener('DOMContentLoaded', function() {
    // Initialize bank logos slider
    if ($('.slider').length) {
        $('.slider').slick({
            slidesToShow: 6,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: false,
            dots: false,
            pauseOnHover: false,
            infinite: true,
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
    }

    // Logo slider animation with infinite scroll
    const logoSlide = document.querySelector('.logos-slide');
    if (logoSlide) {
        const cloneLogos = () => {
            const logos = logoSlide.children;
            const logosArray = Array.from(logos);
            
            // Only clone if we haven't already cloned
            if (logosArray.length === 12) { // Original number of logos
                logosArray.forEach(logo => {
                    const clone = logo.cloneNode(true);
                    logoSlide.appendChild(clone);
                });
            }
        };

        let scrollPosition = 0;
        const scrollSpeed = 0.5;
        
        function slideLogos() {
            scrollPosition -= scrollSpeed;
            const maxScroll = -logoSlide.offsetWidth / 2;
            
            if (Math.abs(scrollPosition) >= Math.abs(maxScroll)) {
                scrollPosition = 0;
            }
            
            logoSlide.style.transform = `translateX(${scrollPosition}px)`;
            requestAnimationFrame(slideLogos);
        }

        // Clone logos and start animation
        cloneLogos();
        slideLogos();
    }

    // Investment Calculator
    const calculator = {
        amount: document.querySelector('#investment-amount'),
        result: document.querySelector('#investment-return'),
        type: document.getElementsByName('investment-type')
    };

    if (calculator.amount) {
        calculator.amount.addEventListener('input', calculateReturn);
        calculator.type.forEach(radio => radio.addEventListener('change', calculateReturn));
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

    if (contactForm) {
        // Add submit event listener
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate form
            if (!this.checkValidity()) {
                this.reportValidity();
                return false;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';

            try {
                const formData = new FormData(this);
                const BOT_TOKEN = '8107565320:AAFrQTEp2do-P7_qTmR2XSV0U-loFi7j02M';
                const CHAT_ID = '-1002607693972';

                // Format message
                let message = '🔔 <b>New Investment Inquiry</b>\n\n';
                const emojis = {
                    name: '👤', phone: '📱', email: '📧',
                    province: '🏠', investment: '💰',
                    amount: '💵', timeline: '⏰',
                    account_type: '🏦'
                };

                for (let [key, value] of formData.entries()) {
                    const emoji = emojis[key] || '➡️';
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                    message += `${emoji} <b>${label}:</b> ${value}\n`;
                }

                const timestamp = new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' });
                message += `\n📅 <b>Submitted:</b> ${timestamp} EST`;

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

                const result = await response.json();

                if (result.ok) {
                    // Show success message
                    const successMsg = document.createElement('div');
                    successMsg.className = 'success-message';
                    successMsg.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                            <span>Thank you! We will contact you shortly.</span>
                        </div>`;
                    contactForm.insertBefore(successMsg, contactForm.firstChild);
                    contactForm.reset();
                    
                    setTimeout(() => {
                        successMsg.remove();
                    }, 5000);
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; background-color: #dc3545; color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                        </svg>
                        <span>Sorry, there was an error. Please try again later.</span>
                    </div>`;
                contactForm.insertBefore(errorMsg, contactForm.firstChild);
                
                setTimeout(() => {
                    errorMsg.remove();
                }, 5000);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });

        // Add validation feedback
        const inputs = contactForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('invalid', function(e) {
                e.preventDefault();
                this.classList.add('is-invalid');
            });

            input.addEventListener('input', function() {
                this.classList.remove('is-invalid');
            });
        });
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