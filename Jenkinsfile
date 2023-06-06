pipeline{
  agent { node{ label'workstation' }}
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
    stage('Build release') {
      steps {
        sh'''
          cd $WORKSPACE
          [ -d "$WORKSPACE/node_modules" ] && rm -rf "$WORKSPACE/node_modules" || true
          npm install terser
          npm install uglifycss
          npm install typescript@5.0
          npm install @types/jquery
          npm i typedoc@0.24
          npm i typedoc-plugin-merge-modules
          buildir="build"
          [ -d "$buildir" ] && rm -rf "$buildir"
          export BUILDDIR="$WORKSPACE/$buildir/opt/www/htdocs/os"
          [ -d "doc" ] && rm -rf doc
          mkdir doc
          export DOCDIR="$WORKSPACE/doc"
          make release
          make doc
        '''
        script {
            // only useful for any master branch
            //if (env.BRANCH_NAME =~ /^master/) {
            archiveArtifacts artifacts: 'd.ts/, build/, doc/', fingerprint: true
            //}
        }
      }
    }
  }
}
