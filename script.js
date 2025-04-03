document.addEventListener('DOMContentLoaded', () => {
    // Show login screen on page load
    const loginScreen = document.getElementById('loginScreen');
    loginScreen.classList.add('active');

    // Initialize time and date
    updateClock();
    setInterval(updateClock, 60000);

    // Initialize Start Menu
    const startButton = document.getElementById('startButton');
    const startMenu = document.getElementById('startMenu');
    
    startButton.addEventListener('click', () => {
        startMenu.classList.toggle('active');
    });

    // Close start menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
            startMenu.classList.remove('active');
        }
    });

    // Initialize power menu
    initPowerMenu();

    // Initialize Desktop Icons
    const desktopIcons = document.querySelectorAll('.icon');
    
    desktopIcons.forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const appName = icon.getAttribute('data-name');
            openApp(appName);
        });
    });

    // Initialize Taskbar Icons
    initTaskbarIcons();

    // Initialize File Explorer
    const fileExplorer = document.getElementById('fileExplorer');
    
    // Make windows draggable
    makeWindowsDraggable();

    // Initialize window controls
    initializeWindowControls();

    // Make desktop icons and taskbar icons sortable
    initSortable();

    // Initialize device settings
    initDeviceSettings();

    // Initialize Settings App
    const settingsApp = document.getElementById('settingsApp');
    settingsApp.addEventListener('click', () => {
        startMenu.classList.remove('active'); // Close start menu when opening settings
        openApp('Settings');
    });

    // Initialize user menu and login screen
    initUserMenu();

    // Fetch weather information
    fetchWeatherInfo();
});

async function fetchWeatherInfo() {
    const temperatureEl = document.getElementById('temperature');
    const locationEl = document.getElementById('location');

    try {
        // Use a free, simple weather API that doesn't require an API key
        const response = await fetch('https://ipapi.co/json/');
        const locationData = await response.json();
        
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${locationData.latitude}&longitude=${locationData.longitude}&current_weather=true`);
        const weatherData = await weatherResponse.json();

        const temperature = Math.round(weatherData.current_weather.temperature);
        
        temperatureEl.textContent = `${temperature}°C`;
        locationEl.textContent = locationData.city || 'Unknown Location';
    } catch (error) {
        console.error('Error fetching weather:', error);
        temperatureEl.textContent = '--°';
        locationEl.textContent = 'Unable to fetch';
    }
}

function updateClock() {
    const now = new Date();
    const timeElement = document.getElementById('time');
    const dateElement = document.getElementById('date');
    
    timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    dateElement.textContent = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
}

function openApp(appName) {
    // Deactivate existing active windows
    const activeWindows = document.querySelectorAll('.window.active');
    activeWindows.forEach(win => {
        win.classList.remove('active');
        
        // Remove active class from corresponding taskbar icons
        const taskbarIcons = document.querySelectorAll('.taskbar-icon');
        taskbarIcons.forEach(icon => {
            icon.classList.remove('active');
        });
    });

    // Open specific app
    if (appName === 'File Explorer') {
        const fileExplorer = document.getElementById('fileExplorer');
        activateWindow(fileExplorer, '.taskbar-icon svg[d*="20,18H4V8H20"]');
    } else if (appName === 'Edge') {
        const edgeWindow = document.getElementById('edgeWindow');
        const edgeIframe = document.getElementById('edgeIframe');
        edgeIframe.src = 'https://swiftgaurd-com.pages.dev/'; 
        activateWindow(edgeWindow, '.taskbar-icon svg[d*="21.86,12.5C21.1,11.63"]');
    } else if (appName === 'Settings') {
        const settingsWindow = document.getElementById('settingsWindow');
        activateWindow(settingsWindow, '.taskbar-icon svg[d*="3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7"]');
    }
}

function activateWindow(windowElement, taskbarIconSelector) {
    windowElement.classList.add('active');
    windowElement.style.left = '100px';
    windowElement.style.top = '50px';

    // Activate corresponding taskbar icon
    const taskbarIcons = document.querySelectorAll('.taskbar-icon');
    taskbarIcons.forEach(icon => {
        const svg = icon.querySelector('svg path');
        if (svg && svg.getAttribute('d').includes(taskbarIconSelector.split('[d*="')[1].split('"]')[0])) {
            icon.classList.add('active');
        }
    });
}

function initTaskbarIcons() {
    const taskbarIcons = document.querySelectorAll('.taskbar-icon');
    
    taskbarIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const svgPath = icon.querySelector('svg path').getAttribute('d');
            
            // File Explorer
            if (svgPath.includes('20,18H4V8H20')) {
                toggleWindow('fileExplorer', icon);
            } 
            // Edge
            else if (svgPath.includes('21.86,12.5C21.1,11.63')) {
                toggleWindow('edgeWindow', icon);
            }
        });
    });
}

function toggleWindow(windowId, taskbarIcon) {
    const window = document.getElementById(windowId);
    
    if (windowId === 'edgeWindow') {
        const edgeIframe = document.getElementById('edgeIframe');
        edgeIframe.src = 'https://swiftgaurd-com.pages.dev/'; 
    }

    if (window.classList.contains('active')) {
        window.classList.remove('active');
        taskbarIcon.classList.remove('active');
    } else {
        // First deactivate all windows
        const activeWindows = document.querySelectorAll('.window.active');
        activeWindows.forEach(win => win.classList.remove('active'));
        
        // Deactivate all taskbar icons
        const taskbarIcons = document.querySelectorAll('.taskbar-icon');
        taskbarIcons.forEach(icon => icon.classList.remove('active'));
        
        // Activate this window and its icon
        window.classList.add('active');
        taskbarIcon.classList.add('active');
        
        // Position the window
        window.style.left = '100px';
        window.style.top = '50px';
    }
}

function initPowerMenu() {
    const powerButton = document.querySelector('.power-button');
    const powerMenu = document.getElementById('powerMenu');
    const powerOff = document.getElementById('powerOff');
    const restart = document.getElementById('restart');
    
    powerButton.addEventListener('click', (e) => {
        e.stopPropagation();
        powerMenu.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!powerMenu.contains(e.target) && !powerButton.contains(e.target)) {
            powerMenu.classList.remove('active');
        }
    });
    
    powerOff.addEventListener('click', () => {
        showSystemNotification('Shutting down...');
        setTimeout(() => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 2s';
        }, 1000);
    });
    
    restart.addEventListener('click', () => {
        showSystemNotification('Restarting...');
        setTimeout(() => {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 1s';
            setTimeout(() => {
                document.body.style.opacity = '1';
                showSystemNotification('System restarted');
            }, 2000);
        }, 1000);
    });
}

function showSystemNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('system-notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }, 10);
}

function makeWindowsDraggable() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        
        let isDragging = false;
        let offsetX, offsetY;
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - win.getBoundingClientRect().left;
            offsetY = e.clientY - win.getBoundingClientRect().top;
            
            // Bring the window to front
            windows.forEach(w => {
                w.style.zIndex = "10";
            });
            win.style.zIndex = "20";
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            win.style.left = `${e.clientX - offsetX}px`;
            win.style.top = `${e.clientY - offsetY}px`;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    });
}

function initializeWindowControls() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(win => {
        const minimizeBtn = win.querySelector('.minimize');
        const maximizeBtn = win.querySelector('.maximize');
        const closeBtn = win.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            win.classList.remove('active');
            
            // Deactivate the corresponding taskbar icon
            if (win.id === 'fileExplorer') {
                const taskbarIcons = document.querySelectorAll('.taskbar-icon');
                taskbarIcons.forEach(icon => {
                    if (icon.querySelector('svg path').getAttribute('d').includes('20,18H4V8H20')) {
                        icon.classList.remove('active');
                    }
                });
            }
        });
        
        minimizeBtn.addEventListener('click', () => {
            win.classList.remove('active');
        });
        
        maximizeBtn.addEventListener('click', () => {
            if (win.style.width === '100vw') {
                win.style.width = '800px';
                win.style.height = '600px';
                win.style.top = '50px';
                win.style.left = '100px';
                win.style.borderRadius = '8px';
            } else {
                win.style.width = '100vw';
                win.style.height = `calc(100vh - var(--taskbar-height))`;
                win.style.top = '0';
                win.style.left = '0';
                win.style.borderRadius = '0';
            }
        });
    });
}

const Sortable = window.Sortable;

function initSortable() {
    // Make desktop icons sortable
    new Sortable(document.querySelector('.desktop-icons'), {
        animation: 150,
        ghostClass: 'sortable-ghost'
    });
    
    // Make taskbar icons sortable
    new Sortable(document.getElementById('taskbarIcons'), {
        animation: 150,
        direction: 'horizontal'
    });
}

function initDeviceSettings() {
    // Brightness control
    const brightnessSlider = document.querySelector('.settings-group:nth-child(1) .settings-item:nth-child(1) input[type="range"]');
    if (brightnessSlider) {
        brightnessSlider.addEventListener('input', (e) => {
            const brightness = e.target.value;
            document.documentElement.style.filter = `brightness(${brightness}%)`;
        });
    }

    // Night light toggle
    const nightLightToggle = document.querySelector('.settings-group:nth-child(1) .settings-item:nth-child(2) input[type="checkbox"]');
    if (nightLightToggle) {
        nightLightToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.style.filter = 'sepia(20%) brightness(90%)';
            } else {
                document.documentElement.style.filter = '';
            }
        });
    }

    // Volume control
    const volumeSlider = document.querySelector('.settings-group:nth-child(2) .settings-item:nth-child(1) input[type="range"]');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            // Just for visual feedback - in a real app this would control audio volume
            const volumeIcon = document.querySelector('.volume-icon svg path');
            if (volumeIcon) {
                if (e.target.value < 30) {
                    volumeIcon.setAttribute('d', 'M7,9V15H11L16,20V4L11,9H7Z');
                } else if (e.target.value < 70) {
                    volumeIcon.setAttribute('d', 'M5,9V15H9L14,20V4L9,9H5M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z');
                } else {
                    volumeIcon.setAttribute('d', 'M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z');
                }
            }
        });
    }

    // Sound scheme dropdown
    const soundSchemeSelect = document.querySelector('.settings-group:nth-child(2) .settings-item:nth-child(2) select');
    if (soundSchemeSelect) {
        soundSchemeSelect.addEventListener('change', () => {
            // Just for visual feedback in this demonstration
            const notification = document.createElement('div');
            notification.classList.add('system-notification');
            notification.textContent = 'Sound scheme changed';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 2000);
            }, 10);
        });
    }

    // Power mode dropdown
    const powerModeSelect = document.querySelector('.settings-group:nth-child(3) select');
    if (powerModeSelect) {
        powerModeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Battery saver') {
                document.documentElement.style.filter = 'brightness(80%)';
            } else if (e.target.value === 'Best performance') {
                document.documentElement.style.filter = 'brightness(110%)';
            } else {
                document.documentElement.style.filter = '';
            }
        });
    }

    // Settings navigation
    const navItems = document.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function initUserMenu() {
    const userProfile = document.getElementById('userProfile');
    const userMenu = document.getElementById('userMenu');
    const lockAccount = document.getElementById('lockAccount');
    const signOut = document.getElementById('signOut');
    const loginScreen = document.getElementById('loginScreen');
    const loginPassword = document.getElementById('loginPassword');
    
    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('active');
    });
    
    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target) && !userProfile.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });
    
    lockAccount.addEventListener('click', () => {
        showLoginScreen();
    });
    
    signOut.addEventListener('click', () => {
        showLoginScreen();
    });
    
    loginPassword.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            hideLoginScreen();
        }
    });
    
    // Update login screen time
    function updateLoginClock() {
        const now = new Date();
        const loginTimeEl = document.getElementById('loginTime');
        const loginDateEl = document.getElementById('loginDate');
        
        if (loginTimeEl && loginDateEl) {
            loginTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            loginDateEl.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        }
    }
    
    function showLoginScreen() {
        updateLoginClock();
        const startMenu = document.getElementById('startMenu');
        startMenu.classList.remove('active');
        userMenu.classList.remove('active');
        loginScreen.classList.add('active');
        setTimeout(() => {
            loginPassword.focus();
        }, 500);
    }
    
    function hideLoginScreen() {
        loginScreen.classList.remove('active');
        loginPassword.value = '';
    }
    
    // Initialize login screen time
    updateLoginClock();
    setInterval(updateLoginClock, 60000);
}