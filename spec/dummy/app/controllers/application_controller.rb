class ApplicationController < ActionController::Base
  protect_from_forgery

  def kss_parser
    paths = [Dough::Engine.root.join('stylesheets')]

    @parser ||= Kss::Parser.new(*paths)
  end

  def sections
    @sections ||= kss_parser.sections.each_with_object({}) do |(k, v), h|
      h[k] = StyleguideSectionDecorator.new(v)
    end
  end
  helper_method :sections

  class StyleguideSectionDecorator
    attr_reader :object

    def initialize(object)
      @object = object
    end

    def id
      "section-#{name.parameterize.dasherize}"
    end

    def name
      object.section
    end

    def description
      object.description
    end

    def filename
      object.filename
    end

    def modifiers
      object.modifiers
    end
  end
end
