describe 'scss/class >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()
  it.skip '1', -> this.shouldBeOk()
