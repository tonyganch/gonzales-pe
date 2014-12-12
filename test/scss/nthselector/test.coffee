describe 'scss/nthselector >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()
  it '1', -> this.shouldBeOk()
  it.skip 'c.0', -> this.shouldBeOk()
  it.skip 'c.1', -> this.shouldBeOk()
  it.skip 's.0', -> this.shouldBeOk()
  it.skip 's.1', -> this.shouldBeOk()
