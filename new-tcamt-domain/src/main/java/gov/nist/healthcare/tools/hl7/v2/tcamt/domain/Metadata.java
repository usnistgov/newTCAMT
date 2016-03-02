package gov.nist.healthcare.tools.hl7.v2.tcamt.domain;

import java.io.Serializable;

import javax.persistence.Column;

import com.fasterxml.jackson.annotation.JsonProperty;


public class Metadata implements Serializable, Cloneable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -5727631810729646337L;

	@JsonProperty("version")
	private String testSuiteVersion;
	
	@JsonProperty("name")
	@Column(columnDefinition="longtext")
	private String testSuiteName;
	
	@JsonProperty("domain")
	@Column(columnDefinition="longtext")
	private String testSuiteDomain;
	
	@JsonProperty("adminEmail")
	private String testSuiteAdminEmail;
	
	@JsonProperty("description")
	@Column(columnDefinition="longtext")
	private String testSuiteDescription;
	
	@JsonProperty("header")
	@Column(columnDefinition="longtext")
	private String testSuiteHeader;
	
	@JsonProperty("homeTitle")
	@Column(columnDefinition="longtext")
	private String testSuiteHomeTitle;
	
	@JsonProperty("homeContent")
	@Column(columnDefinition="longtext")
	private String testSuiteHomeContent;

	public String getTestSuiteVersion() {
		return testSuiteVersion;
	}

	public void setTestSuiteVersion(String testSuiteVersion) {
		this.testSuiteVersion = testSuiteVersion;
	}

	public String getTestSuiteName() {
		return testSuiteName;
	}

	public void setTestSuiteName(String testSuiteName) {
		this.testSuiteName = testSuiteName;
	}

	public String getTestSuiteDomain() {
		return testSuiteDomain;
	}

	public void setTestSuiteDomain(String testSuiteDomain) {
		this.testSuiteDomain = testSuiteDomain;
	}

	public String getTestSuiteAdminEmail() {
		return testSuiteAdminEmail;
	}

	public void setTestSuiteAdminEmail(String testSuiteAdminEmail) {
		this.testSuiteAdminEmail = testSuiteAdminEmail;
	}

	public String getTestSuiteDescription() {
		return testSuiteDescription;
	}

	public void setTestSuiteDescription(String testSuiteDescription) {
		this.testSuiteDescription = testSuiteDescription;
	}

	public String getTestSuiteHeader() {
		return testSuiteHeader;
	}

	public void setTestSuiteHeader(String testSuiteHeader) {
		this.testSuiteHeader = testSuiteHeader;
	}

	public String getTestSuiteHomeTitle() {
		return testSuiteHomeTitle;
	}

	public void setTestSuiteHomeTitle(String testSuiteHomeTitle) {
		this.testSuiteHomeTitle = testSuiteHomeTitle;
	}

	public String getTestSuiteHomeContent() {
		return testSuiteHomeContent;
	}

	public void setTestSuiteHomeContent(String testSuiteHomeContent) {
		this.testSuiteHomeContent = testSuiteHomeContent;
	}

	public Metadata() {
		super();
	}
	
	@Override
	public Metadata clone() throws CloneNotSupportedException {
		Metadata cloned = (Metadata)super.clone();
		return cloned;
	}
}
