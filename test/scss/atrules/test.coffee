describe 'scss/atrules >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()
  it '1', -> this.shouldBeOk()
  it '2', -> this.shouldBeOk()

  it 'c.0', -> this.shouldBeOk()
  it 'c.1', -> this.shouldBeOk()

  it 's', -> this.shouldBeOk()
