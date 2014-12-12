describe 'scss/filter >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()
  it '1', -> this.shouldBeOk()
  it '2', -> this.shouldBeOk()
  it '3', -> this.shouldBeOk()
  it '4', -> this.shouldBeOk()
  it '5', -> this.shouldBeOk()

  it 'c.0', -> this.shouldBeOk()
  it 'c.1', -> this.shouldBeOk()

  it 's.0', -> this.shouldBeOk()
  it 's.1', -> this.shouldBeOk()
