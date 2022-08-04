def remote = [:]
remote.name = 'workstation'
remote.host = 'workstation'
remote.user = 'dany'
remote.identityFile = '/var/jenkins_home/.ssh/id_rsa'
remote.allowAnyHosts = true
remote.agent = false
remote.logLevel = 'INFO'

pipeline{
  agent { node{ label'master' }}
  options {
    // Limit build history with buildDiscarder option:
    // daysToKeepStr: history is only kept up to this many days.
    // numToKeepStr: only this many build logs are kept.
    // artifactDaysToKeepStr: artifacts are only kept up to this many days.
    // artifactNumToKeepStr: only this many builds have their artifacts kept.
    buildDiscarder(logRotator(numToKeepStr: "1"))
    // Enable timestamps in build log console
    timestamps()
    // Maximum time to run the whole pipeline before canceling it
    timeout(time: 1, unit: 'HOURS')
    // Use Jenkins ANSI Color Plugin for log console
    ansiColor('xterm')
    // Limit build concurrency to 1 per branch
    disableConcurrentBuilds()
  }
  stages
  {
    stage('Prebuild build') {
      steps {
        sshCommand remote: remote, command: '''
            set -e
            export WORKSPACE=$(realpath "./jenkins/workspace/antos")
            [ -d build ] && rm -rf build
            mkdir -p build/opt/www/htdocs/os
            cd $WORKSPACE
            npm install terser
            npm install uglifycss
            npm install typescript
            npm install @types/jquery
          '''
      }
    }
    stage('Build demo') {
      steps {
        sshCommand remote: remote, command: '''
            set -e
            export WORKSPACE=$(realpath "./jenkins/workspace/antos")
            cd $WORKSPACE
            export BUILDDIR="/home/dany/docker/antos/htdocs/os"
            make
          '''
      }
    }
    stage('Build release') {
      steps {
        sshCommand remote: remote, command: '''
            set -e
            export WORKSPACE=$(realpath "./jenkins/workspace/antos")
            cd $WORKSPACE
            export BUILDDIR="$WORKSPACE/build/opt/www/htdocs/os"
            make release
          '''
        script {
            // only useful for any master branch
            //if (env.BRANCH_NAME =~ /^master/) {
            archiveArtifacts artifacts: 'd.ts/, build/', fingerprint: true
            //}
        }
      }
    }
  }
}
