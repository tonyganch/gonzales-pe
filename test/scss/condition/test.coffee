describe 'scss/condition >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()
  it '1', -> this.shouldBeOk()
  it '2', -> this.shouldBeOk()
  it '3', -> this.shouldBeOk()
  it.skip '4', -> this.shouldBeOk()
  it.skip '5', -> this.shouldBeOk()
  it.skip '6', -> this.shouldBeOk()
