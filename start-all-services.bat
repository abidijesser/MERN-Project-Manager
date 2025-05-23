@echo off
echo Starting all services...

echo Starting Server on port 3001...
start cmd /k "cd Server && npm run dev"

echo Starting Client on port 3000...
start cmd /k "cd Client && npm start"

echo Starting Admin on port 5173...
start cmd /k "cd Admin\mantis-free-react-admin-template-master && npm run start"

echo All services started!
echo Server: http://localhost:3001
echo Client: http://localhost:3000
echo Admin: http://localhost:5173

pause
