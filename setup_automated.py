#!/usr/bin/env python3
"""
Automated setup script for GitHub Branch Protection and Vercel Configuration
Uses GitHub API and Vercel API to configure the development workflow
"""

import subprocess
import json
import sys
import os

# Colors for terminal output
class Colors:
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def run_command(cmd, check=True):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            check=check
        )
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    except subprocess.CalledProcessError as e:
        return e.stdout.strip(), e.stderr.strip(), e.returncode

def print_step(message):
    """Print a step message"""
    print(f"\n{Colors.BLUE}▶ {message}{Colors.NC}")

def print_success(message):
    """Print a success message"""
    print(f"{Colors.GREEN}✓ {message}{Colors.NC}")

def print_warning(message):
    """Print a warning message"""
    print(f"{Colors.YELLOW}⚠ {message}{Colors.NC}")

def print_error(message):
    """Print an error message"""
    print(f"{Colors.RED}✗ {message}{Colors.NC}")

def check_dependencies():
    """Check if required tools are installed"""
    print_step("Checking dependencies...")
    
    tools = {
        'gh': 'GitHub CLI',
        'vercel': 'Vercel CLI'
    }
    
    all_ok = True
    for tool, name in tools.items():
        stdout, _, code = run_command(f'which {tool}', check=False)
        if code != 0:
            print_error(f"{name} ({tool}) is not installed")
            all_ok = False
        else:
            print_success(f"{name} is installed")
    
    return all_ok

def check_authentication():
    """Check if user is authenticated"""
    print_step("Checking authentication...")
    
    # Check GitHub
    stdout, stderr, code = run_command('gh auth status', check=False)
    if code != 0:
        print_error("Not authenticated with GitHub")
        print("Run: gh auth login")
        return False
    print_success("Authenticated with GitHub")
    
    # Check Vercel
    stdout, stderr, code = run_command('vercel whoami', check=False)
    if code != 0:
        print_error("Not authenticated with Vercel")
        print("Run: vercel login")
        return False
    print_success("Authenticated with Vercel")
    
    return True

def setup_github_branch_protection():
    """Set up GitHub branch protection"""
    print_step("Setting up GitHub branch protection...")
    
    repo = "xplore9230/ux-skills-assessment"
    
    # Check if repo is private
    stdout, _, code = run_command(
        f'gh api repos/{repo} --jq ".private"',
        check=False
    )
    
    if code != 0:
        print_error("Could not check repository status")
        return False
    
    is_private = stdout.lower() == 'true'
    
    if is_private:
        print_warning("Repository is private")
        print("GitHub branch protection via API requires GitHub Pro for private repos.")
        print("\nPlease set up branch protection manually:")
        print(f"1. Go to: https://github.com/{repo}/settings/branches")
        print("2. Click 'Add rule' for 'main' branch")
        print("3. Configure settings (see GITHUB_BRANCH_PROTECTION.md)")
        return False
    
    # Try to set up branch protection
    protection_config = {
        "required_status_checks": {
            "strict": True,
            "contexts": []
        },
        "enforce_admins": True,
        "required_pull_request_reviews": {
            "required_approving_review_count": 1,
            "dismiss_stale_reviews": True,
            "require_code_owner_reviews": False,
            "require_last_push_approval": False
        },
        "restrictions": None,
        "required_linear_history": False,
        "allow_force_pushes": False,
        "allow_deletions": False
    }
    
    config_json = json.dumps(protection_config)
    cmd = f'gh api repos/{repo}/branches/main/protection -X PUT -f \'{config_json}\''
    
    stdout, stderr, code = run_command(cmd, check=False)
    
    if code == 0:
        print_success("Branch protection enabled for 'main' branch")
        return True
    else:
        print_error(f"Failed to set up branch protection: {stderr}")
        print("\nPlease set up branch protection manually:")
        print(f"1. Go to: https://github.com/{repo}/settings/branches")
        return False

def setup_vercel_config():
    """Provide Vercel configuration instructions"""
    print_step("Vercel Configuration")
    
    project_name = "ux-skills-assessment"
    
    # Check if project exists
    stdout, stderr, code = run_command('vercel projects ls', check=False)
    
    if code == 0 and project_name in stdout:
        print_success(f"Project '{project_name}' found on Vercel")
    else:
        print_warning(f"Project '{project_name}' not found or not accessible")
    
    print("\nVercel configuration needs to be done via web dashboard:")
    print("1. Go to: https://vercel.com/dashboard")
    print(f"2. Select project: {project_name}")
    print("3. Go to Settings → Git")
    print("4. Configure:")
    print("   - Production Branch: main")
    print("   - Enable Preview Deployments")
    print("   - Add 'dev' to Branch Deployments")
    print("\n5. Go to Settings → Environment Variables")
    print("   Add variables for different environments")
    print("\nSee VERCEL_MULTI_ENV_SETUP.md for detailed instructions.")

def main():
    """Main setup function"""
    print("=" * 50)
    print("GitHub & Vercel Automated Setup")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        print_error("Please install missing dependencies")
        sys.exit(1)
    
    # Check authentication
    if not check_authentication():
        print_error("Please authenticate with GitHub and Vercel")
        sys.exit(1)
    
    # Setup GitHub
    github_ok = setup_github_branch_protection()
    
    # Setup Vercel
    setup_vercel_config()
    
    # Summary
    print("\n" + "=" * 50)
    print("Setup Summary")
    print("=" * 50)
    
    if github_ok:
        print_success("GitHub branch protection configured")
    else:
        print_warning("GitHub branch protection needs manual setup")
    
    print_warning("Vercel configuration needs manual setup via dashboard")
    
    print("\nNext steps:")
    print("1. Complete GitHub branch protection (if needed)")
    print("2. Complete Vercel configuration via dashboard")
    print("3. Share QUICK_START_WORKFLOW.md with your team")
    
    print("\nDocumentation files:")
    print("  - DEVELOPMENT_WORKFLOW.md")
    print("  - GITHUB_BRANCH_PROTECTION.md")
    print("  - VERCEL_MULTI_ENV_SETUP.md")
    print("  - QUICK_START_WORKFLOW.md")

if __name__ == "__main__":
    main()

