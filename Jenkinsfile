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
    stage('Build') {
      steps {
        sshCommand remote: remote, command: '''
            set -e
            export WORKSPACE=$(realpath "./jenkins/workspace/antos")
            cd $WORKSPACE
            npm install terser
            npm install uglifycss
            npm install typescript
            npm install @types/jquery
            make ar
          '''
        script {
            // only useful for any master branch
            //if (env.BRANCH_NAME =~ /^master/) {
            archiveArtifacts artifacts: 'd.ts,release/antos-1.1.2.tar.gz', fingerprint: true
            //}
        }
      }
    }
  }
}
