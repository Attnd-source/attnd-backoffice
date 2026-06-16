@echo off
REM Double-click this to upload the project to GitHub.
REM A GitHub sign-in window will open the first time — sign in / authorize.
cd /d "C:\Users\laila\attnd-backoffice"
set "PATH=C:\Users\laila\node-x64;%PATH%"
git remote remove origin 2>nul
git remote add origin https://github.com/Attnd-source/attnd-backoffice.git
echo Pushing to GitHub... (sign in if a window appears)
git push -u origin main
echo.
echo ============================================
echo  If you see "branch 'main' set up to track" above, it worked.
echo ============================================
pause
