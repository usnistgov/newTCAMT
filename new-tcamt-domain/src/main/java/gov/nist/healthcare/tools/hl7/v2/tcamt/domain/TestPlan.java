package gov.nist.healthcare.tools.hl7.v2.tcamt.domain;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.Id;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "testplan")
public class TestPlan implements Serializable, Cloneable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 2818730764705058185L;

	@Id
	private long id;

	private String name;
	private String description;
	private String lastUpdateDate;
	private String coverPageTitle;
	private String coverPageSubTitle;
	private String coverPageVersion;
	private String coverPageDate;
	private Integer version;
	private Set<TestCase> testcases = new HashSet<TestCase>();
	private Set<TestCaseGroup> testcasegroups = new HashSet<TestCaseGroup>();
	private Long accountId;
	private String type;
	private Metadata metadata = new Metadata();
	private boolean jurorDocumentEnable;

	private Integer position;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.metadata.setTestSuiteName(name);
		this.name = name;
	}

	public Integer getVersion() {
		return version;
	}

	public void setVersion(Integer version) {
		this.version = version;
	}

	public void addTestCase(TestCase testcase) {
		this.testcases.add(testcase);
	}

	public void addTestCaseGroup(TestCaseGroup testcasegroup) {
		this.testcasegroups.add(testcasegroup);
	}

	public Set<TestCase> getTestcases() {
		return testcases;
	}

	public void setTestcases(Set<TestCase> testcases) {
		this.testcases = testcases;
	}

	public Set<TestCaseGroup> getTestcasegroups() {
		return testcasegroups;
	}

	public void setTestcasegroups(Set<TestCaseGroup> testcasegroups) {
		this.testcasegroups = testcasegroups;
	}

	public Metadata getMetadata() {
		return metadata;
	}

	public void setMetadata(Metadata metadata) {
		this.metadata = metadata;
	}

	public String getLastUpdateDate() {
		return lastUpdateDate;
	}

	public void setLastUpdateDate(String lastUpdateDate) {
		this.lastUpdateDate = lastUpdateDate;
	}

	@Override
	public TestPlan clone() throws CloneNotSupportedException {
		TestPlan cloned = (TestPlan) super.clone();
		cloned.setId(0);
		cloned.setVersion(0);

		cloned.setMetadata(this.metadata.clone());

		Set<TestCase> cTestcases = new HashSet<TestCase>();
		for (TestCase testcase : this.testcases) {
			cTestcases.add(testcase.clone());
		}
		cloned.setTestcases(cTestcases);

		Set<TestCaseGroup> ctestcasegroups = new HashSet<TestCaseGroup>();
		for (TestCaseGroup group : this.testcasegroups) {
			ctestcasegroups.add(group.clone());
		}
		cloned.setTestcasegroups(ctestcasegroups);

		return cloned;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public boolean isJurorDocumentEnable() {
		return jurorDocumentEnable;
	}

	public void setJurorDocumentEnable(boolean jurorDocumentEnable) {
		this.jurorDocumentEnable = jurorDocumentEnable;
	}

	public Integer getPosition() {
		return position;
	}

	public void setPosition(Integer position) {
		this.position = position;
	}

	public String getCoverPageTitle() {
		return coverPageTitle;
	}

	public void setCoverPageTitle(String coverPageTitle) {
		this.coverPageTitle = coverPageTitle;
	}

	public String getCoverPageVersion() {
		return coverPageVersion;
	}

	public void setCoverPageVersion(String coverPageVersion) {
		this.coverPageVersion = coverPageVersion;
	}

	public String getCoverPageDate() {
		return coverPageDate;
	}

	public void setCoverPageDate(String coverPageDate) {
		this.coverPageDate = coverPageDate;
	}

	public String getCoverPageSubTitle() {
		return coverPageSubTitle;
	}

	public void setCoverPageSubTitle(String coverPageSubTitle) {
		this.coverPageSubTitle = coverPageSubTitle;
	}

	public Long getAccountId() {
		return accountId;
	}

	public void setAccountId(Long accountId) {
		this.accountId = accountId;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
}
