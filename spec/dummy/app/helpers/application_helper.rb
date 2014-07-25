module ApplicationHelper
  def styleguide_section(section, &example)
    partial = 'common/section'

    render layout: partial, locals: { section: section }, &example
  end

  def html(line_numbers: false, &block)
    source = strip_leading_indentation_from_source(capture(&block))
    tokens = Rouge::Lexers::HTML.lex(source)

    format_tokens_as_html(tokens, line_numbers)
  end

  def strip_leading_indentation_from_source(source)
    source.strip.gsub(/^[  ]{2}/, '')
  end

  def format_tokens_as_html(tokens, line_numbers)
    formatter = Rouge::Formatters::HTML.new(line_numbers: line_numbers)

    formatter.format(tokens).html_safe
  end
end
