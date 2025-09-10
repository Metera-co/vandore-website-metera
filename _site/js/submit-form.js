$(function () {
    // Form submission handler
    $('.form').on('submit', function (e) {
        e.preventDefault();
        
        const form = $(this);
        const formData = new FormData(this);
        const action = formData.get('action');
        
        // Clear previous messages
        form.find('.success_msg, .error_msg').removeClass('show');
        
        // Basic validation
        if (!this.checkValidity()) {
            this.classList.add('was-validated');
            return;
        }
        
        // Show loading state
        const submitBtn = form.find('button[type="submit"]');
        const originalText = submitBtn.html();
        submitBtn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin"></i> Sending...');
        
        // Simulate form submission (replace with actual endpoint)
        setTimeout(() => {
            try {
                if (action === 'subscribe') {
                    // Handle newsletter subscription
                    const email = formData.get('email');
                    if (email && isValidEmail(email)) {
                        showToast('.success_msg_subscribe', 'Your subscription was successful!');
                        form[0].reset();
                    } else {
                        throw new Error('Invalid email address');
                    }
                } else {
                    // Handle contact form
                    const name = formData.get('name');
                    const email = formData.get('email');
                    const message = formData.get('message');
                    
                    if (name && email && isValidEmail(email)) {
                        form.find('.success_msg').addClass('show');
                        form[0].reset();
                        form.removeClass('was-validated');
                    } else {
                        throw new Error('Please fill in all required fields');
                    }
                }
            } catch (error) {
                form.find('.error_msg').addClass('show');
                console.error('Form submission error:', error);
            } finally {
                // Restore button state
                submitBtn.prop('disabled', false).html(originalText);
            }
        }, 1000);
    });
    
    // Email validation helper
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Toast helper
    function showToast(selector, message) {
        const toast = $(selector);
        if (toast.length) {
            if (message) {
                toast.find('.toast-body').text(message);
            }
            const bsToast = new bootstrap.Toast(toast[0]);
            bsToast.show();
        }
    }
    
    // Real-time email validation for subscription forms
    $('.subscribe').on('input', function () {
        const email = $(this).val();
        const isValid = isValidEmail(email);
        
        if (email.length > 0) {
            $(this).toggleClass('is-valid', isValid);
            $(this).toggleClass('is-invalid', !isValid);
        } else {
            $(this).removeClass('is-valid is-invalid');
        }
    });
});